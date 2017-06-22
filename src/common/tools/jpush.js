/**
 * 极光推送
 */
angular.module('app.services')
    .factory('jPushService', function($ionicPlatform, $rootScope, stateUtils, messageCenter, popup, modals, localStorage) {
        var DEFAULT_TAGS = [APP_CONFIG.channel.replace(/[ ]/g,"")];
        var localJPushTags = localStorage.get('jPushTags') || [];
        var info = {
            tags: localJPushTags.concat(DEFAULT_TAGS),
            alias: APP_USER.id
        };

        var jPush = null;

        // 处理打开通知数据
        function handleOpenNotificationData(event) {
            if (ionic.Platform.isAndroid()) {
                return handleAndroidData(window.plugins.jPushPlugin.openNotification);
            }
            if (ionic.Platform.isIOS()) {
                return handleiOSData(event);
            }
        }

        // 处理android推送信息数据
        function handleAndroidData (data) {
            var result = {alert: data.alert};
            if (data.extras) {
                result.params = data.extras['cn.jpush.android.EXTRA'];
            }
            return result;
        }

        // 处理ios推送信息数据
        function handleiOSData (data) {
            return {
                alert: data.aps ? data.aps.alert : undefined,
                params: data
            };
        }

        // 处理状态转换
        function handleStateChange (data) {
            var params = data ? data.params : {};

            if (params.state) {
                // 关闭所有弹出层
                for (var name in modals.$showModals) {
                    modals.$showModals[name].close();
                }
                switch (params.state.toLowerCase()) {
                    case 'productinfo':
                        if (params.id && !params.productId) {
                            params.productId = params.id;
                        }
                        stateUtils.goProductInfo(params.productId, params.goodsId, params.title);
                        break;
                    case 'productlist':
                        stateUtils.goProductList({url:params.url}, params.title);
                        break;
                    case 'flashsale':
                        stateUtils.goFlashSale();
                        break;
                    case 'article':
                        stateUtils.goArticle(params.id, params.title);
                        break;
                }
            }
        }

        // 初始化极光推送
        function init() {
            $ionicPlatform.ready(function() {
                jPush = window.plugins ? window.plugins.jPushPlugin : null;

                if (jPush) {
                    // 处理打开通知
                    document.addEventListener("jpush.openNotification", function(event) {
                        jPush.resetBadge();
                        jPush.setApplicationIconBadgeNumber(0);
                        var data = handleOpenNotificationData(event);
                        handleStateChange(data);
                    }, false);

                    if (ionic.Platform.isIOS()) {
                        document.addEventListener("jpush.receiveNotification", function(event) {
                            var data = handleOpenNotificationData(event);
                            if (data.params.state) {
                                popup.notificationConfirm(data.alert)
                                    .then(function(response) {
                                        if (response) {
                                            handleStateChange(data);
                                        }
                                    });
                            } else {
                                popup.notificationAlert(data.alert);
                            }
                        }, false);
                    }

                    // document.addEventListener("jpush.receiveMessage", function(event) {
                    // }, false);

                    jPush.setDebugMode(false);
                    jPush.init();
                    jPush.setTagsWithAlias(info.tags, info.alias || "");
                    jPush.resetBadge();
                    jPush.setApplicationIconBadgeNumber(0);
                }
            });
        }

        messageCenter.subscribeMessage('login', function(event, data) {
            setTimeout(function() {
                var jpushTags = data.jpushTags;
                if (jpushTags && jpushTags.length && jPush) {
                    jpushTags = jpushTags instanceof Array ? jpushTags : [jpushTags];
                    info.tags = jpushTags.concat(DEFAULT_TAGS);
                    jPush.setTagsWithAlias(info.tags, APP_USER.id);
                } else {
                    jpushService.setAlias(APP_USER.id);
                }

            });
        }, $rootScope);

        messageCenter.subscribeMessage('logout', function(event) {
            setTimeout(function() {
                jpushService.setAlias('');
            });
        }, $rootScope);


        messageCenter.subscribeMessage('setTags', function(event, tags) {
            tags = tags instanceof Array ? tags : [tags];
            info.tags = tags.concat(DEFAULT_TAGS);
            localStorage.set('jPushTags', info.tags);
        }, $rootScope);


        var jpushService =  {
            init: init,
            // 设置用户名
            setAlias: function (alias) {
                if (jPush) {
                    info.alias = alias;
                    jPush.setAlias(info.alias);
                }
            },
            // 添加标签
            addTag: function (tag) {
                if (jPush) {
                    info.tags.push(tag);
                    jPush.setTags(info.tags);
                }
            }
        };
        return jpushService;
    });
