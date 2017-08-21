/**
 * 数据统计
 * 基于com.comall.umeng插件
 *
 */
angular.module('app.services').factory('analytics', function(
    $rootScope, messageCenter, stateUtils
) {

    var umeng = null;
    var history = null;

    return {
        init: function() {
            umeng = window.UMAnalytics;

            if (!umeng) return;

            history = [];
            // console.log('enter:' + '首页_v2');

            // 监听视图进入
            $rootScope.$on('$ionicView.afterEnter', function(event, data) {
                if (data.stateName) {
                    var title = (data.title || data.stateName);
                    history.push(title);
                    umeng.onPageStart(title);
                    // console.log('enter:' + title);
                }
            });

            // 监听视图离开
            $rootScope.$on('$ionicView.beforeLeave', function(event, data) {
                var title = history.pop();
                umeng.onPageEnd(title);
                // console.log('leave:' + title);
            });

            // 监听弹出层开启
            messageCenter.subscribeMessage('modal.open', function(event, title) {
                umeng.onPageEnd(history[history.length - 1]);
                // console.log('leave:' + history[history.length - 1]);
                history.push(title);
                umeng.onPageStart(title);
                // console.log('enter:' + title);
            });

            // 监听弹出层关闭
            messageCenter.subscribeMessage('modal.close', function(event, title) {
                var lastState = history.pop();
                umeng.onPageEnd(lastState);
                // console.log('leave:' + lastState);
                umeng.onPageStart(history[history.length - 1]);
                // console.log('enter:' + history[history.length - 1]);
            });

            // 监听注册成功
            messageCenter.subscribeMessage('register.success', function(event) {
                umeng.onEvent('register');
            });

            // 监听提交订单成功，金额取整，友盟统计仅支持整数
            messageCenter.subscribeMessage('checkout.success', function(event, data) {
                umeng.onEventValue('submit_order', parseInt(data.payableAmount));
            });

            // 监听支付成功，金额取整，友盟统计仅支持整数
            messageCenter.subscribeMessage('pay.success', function(event, data) {
                umeng.onEventValue('pay_success', parseInt(data.payableAmount));
            });
        }
    };
});
