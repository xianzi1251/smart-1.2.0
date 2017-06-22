/**
 * 数据统计
 * 基于com.comall.umeng插件
 *
 */
angular.module('app.services').factory('analytics', function(
    $rootScope, messageCenter, stateUtils
) {

    var advTypes = {
        0: '网页',
        1: '商品详情',
        2: '商品列表',
        3: '抢购页',
        4: '文章页',
        5: '注册页',
        6: '跳转物流查询',
        7: '松鼠币商城',
        8: '松鼠会员卡',
        9: '体验店列表',
        10: '专题页',
        11: '文章列表'
    };
    var umeng = null;
    var growing = null;
    var sensorsAnalytics = null;
    var history = [];
    var lastState = null;

    return {
        init: function() {
            umeng = window.umeng;
            growing = window.Growing;
            sensorsAnalytics = window.SensorsAnalytics;

            if (growing && APP_USER.id) {
                growing.login(APP_USER.id, APP_USER.loginName);
            }
            if (SensorsData) {
                if (APP_USER.id) {
                    SensorsData.identify(APP_USER.id, true);
                }
                var config = {platform: APP_CONFIG.os};
                if (window.device) {
                    config.$manufacturer = window.device.manufacturer;
                    config.$model = window.device.model;
                }
                SensorsData.registerPage(config);
            }

            function SATrackPageView(state) {
                if (SensorsData) {
                    var property = {
                        $referrer: lastState ? lastState.url : document.referrer,
                        $url: state.url,
                        $title: state.title,
                    };
                    var networkType = navigator.connection && navigator.connection.type;
                    if (networkType) {
                        property.$wifi = networkType == 'wifi';
                        property.$network_type = networkType;
                    }
                    SensorsData.track('$pageview', property);
                }
            }

            // 监听视图进入
            $rootScope.$on('$ionicView.afterEnter', function(event, data) {
                if (data.stateName) {
                    var state = {
                        title: data.title || data.stateName,
                        url: window.location.hash
                    };
                    history.push(state);
                    // console.log('enter:' + state.title);
                    if (umeng) {
                        umeng.onPageStart(state.title + '_v2');
                    }
                    SATrackPageView(state);
                }
            });

            // 监听视图离开
            $rootScope.$on('$ionicView.beforeLeave', function(event, data) {
                lastState = history.pop();
                // console.log('leave:' + lastState.title);
                if (umeng) {
                    umeng.onPageEnd(lastState.title + '_v2');
                }
            });

            // 监听弹出层开启
            messageCenter.subscribeMessage('modal.open', function(event, title) {
                lastState = history[history.length - 1];
                var state = {
                    title: title,
                    url: window.location.hash
                };
                history.push(state);
                // console.log('leave:' + lastState.title);
                // console.log('enter:' + state.title);
                if (umeng) {
                    umeng.onPageEnd(lastState.title + '_v2');
                    umeng.onPageStart(state.title + '_v2');
                }
                SATrackPageView(state);
            });

            // 监听弹出层关闭
            messageCenter.subscribeMessage('modal.close', function(event, title) {
                lastState = history.pop();
                var state = history[history.length - 1];
                // console.log('leave:' + lastState.title);
                // console.log('enter:' + state.title);
                if (umeng) {
                    umeng.onPageEnd(lastState.title + '_v2');
                    umeng.onPageStart(state.title + '_v2');
                }
                SATrackPageView(state);
            });

            // 用户登录
            messageCenter.subscribeMessage('login', function(event, userInfo) {
                if (growing) {
                    growing.login(userInfo.id, userInfo.loginName);
                }
                if (SensorsData) {
                    SensorsData.identify(userInfo.id, true);
                }
            });

            // 用户登出
            messageCenter.subscribeMessage('logout', function(event) {
                if (growing) {
                    growing.logout();
                }
                if (SensorsData) {
                    SensorsData.identify();
                }
            });

            // 监听注册成功
            messageCenter.subscribeMessage('register', function(event, userInfo) {
                if (umeng) {
                    umeng.onEvent('register_v2');
                }
                if (sensorsAnalytics) {
                    sensorsAnalytics.trackRegister(userInfo.id);
                }
            });

            // 监听提交订单成功
            messageCenter.subscribeMessage(['checkout.success', 'integralCheckout.success'], function(event, data) {
                if (umeng) {
                    umeng.onEventValue('submit_order_v2', parseInt(data.payableAmount * 100));
                }
            });

            // 监听支付成功
            messageCenter.subscribeMessage(['pay.success', 'integralPay.success'], function(event, data) {
                if (umeng) {
                    umeng.onEventValue('pay_success_v2', parseInt(data.payableAmount * 100));
                }
            });
        },

        trackAdv: function(data, position) {
            if (SensorsData) {
                var property = {
                    target: (data.param && (data.param.id ? data.param.id : data.param.url) || '') + '',
                    name: data.name,
                    type: advTypes[data.type] || data.type,
                    position: position,
                };
                var networkType = navigator.connection && navigator.connection.type;
                if (networkType) {
                    property.$wifi = networkType == 'wifi';
                    property.$network_type = networkType;
                }
                SensorsData.track('trackAdv', property);
            }
        }
    };
});

angular.module('app.directives').directive('cmTrackAdv', function(
    analytics
) {
    return {
        restrict: 'A',
        link: function($scope, $el, $attrs) {
            $el.on('click', function() {
                analytics.trackAdv($scope.$eval($attrs.cmTrackAdv), $attrs.advPosition);
            });
        }
    };
});
