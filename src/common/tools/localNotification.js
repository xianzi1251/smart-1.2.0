 /**
 * 本地通知
 */
angular.module('app.services').factory('localNotification',function(
    $ionicPlatform, localStorage, stateUtils, loading, toast
){
    var NOTIFICATION_KEY = 'notification-records';
    var notification;
    var notificationRecords;

    function closeLoading() {
        loading.close();
    }

    return {
        init: function() {
            if (window.cordova && cordova.plugins &&
                    cordova.plugins.notification && cordova.plugins.notification.local) {
                notification = cordova.plugins.notification.local;
                notification.on("click", function (message, state) {
                    if (message.data) {
                        var data = JSON.parse(message.data);
                        stateUtils.goProductInfo(data.productId);
                        delete notificationRecords[data.eventId + '-' + data.productId];
                        localStorage.set(NOTIFICATION_KEY, notificationRecords);
                    }
                });

                notificationRecords = localStorage.get(NOTIFICATION_KEY, {});
                var current = new Date().getTime();
                for (var key in notificationRecords) {
                    var record = notificationRecords[key];
                    if (record.target < current) {
                        delete notificationRecords[key];
                    }
                }
                localStorage.set(NOTIFICATION_KEY, notificationRecords);
                // 清除应用上的消息提示数
                // cordova.plugins.notification.badge.clear();
            }
        },

        /**
         * 生成本地通知
         */
        open: function(text) {
            if (!notification) {
                return;
            }
            var current = new Date();
            notification.schedule({
                id: current.getTime(),
                text: text,
                at: current,
            });
        },

        /**
         * 开启定时提醒
         */
        schedule: function(productId, productName, eventId, countdown) {
            if (!notification) {
                return;
            }
            loading.open();
            var target = new Date().getTime() + countdown;
            var timer = setTimeout(function () {
                loading.close();
                toast.open('主人提醒设置失败了，请检查是否允许通知');
            }, 3000);
            notification.schedule({
                id: (+eventId) + (+productId),
                title: '抢购提醒',
                text: '主人快去抢购' + productName,
                at: new Date(target),
                data: {
                    eventId: eventId,
                    productId: productId
                }
            }, function () {
                clearTimeout(timer);
                notificationRecords[eventId + '-' + productId] = {
                    eventId: eventId,
                    productId: productId,
                    target: target
                };
                localStorage.set(NOTIFICATION_KEY, notificationRecords);
                loading.close();
            });

        },

        /**
         * 取消定时提醒
         */
        cancel: function(productId, eventId) {
            if (!notification) {
                return;
            }
            notification.cancel((+eventId) + (+productId));
            delete notificationRecords[eventId + '-' + productId];
            localStorage.set(NOTIFICATION_KEY, notificationRecords);
        },

        /**
         * 检查商品是否已添加提醒
         */
        isScheduled: function(productId, eventId) {
            if (!notification) {
                return false;
            }
            return !!notificationRecords[eventId + '-' + productId];
        }

    };
});
