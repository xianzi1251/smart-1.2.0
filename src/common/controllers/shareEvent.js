angular.module('app.controllers').controller('shareEventCtrl', function(
    $scope, $params, toast, modals
) {

    var ctrl = this;

    var shareData = $params.shareData;

    _.assign(ctrl, {
        $scope: $scope,

        // 是否支持微信
        isSupportWechat: false,

        // 确定当前是否可分享
        init: function() {
            if (window.wechatPay) {
                window.wechatPay.checkAppInstalled(function(res) {
                    if (res === 'true') {
                        ctrl.isSupportWechat = true;
                    }
                }, function(error) {

                });
            }
        },

        // 分享给朋友
        shareToWechat: function() {
            if (!ctrl.isSupportWechat) {
                toast.open('您还没有安装微信客户端');
                return;
            }

            window.wechatPay.share(_.merge({
                type: 0
            }, shareData), function() {
                ctrl.close();
            }, function(error) {
                toast.open(error);
            });
        },

        // 分享至朋友圈
        shareToWechatTimeline: function() {
            if (!ctrl.isSupportWechat) {
                toast.open('您还没有安装微信客户端');
                return;
            }

            window.wechatPay.share(_.merge({
                type: 1
            }, shareData), function() {
                ctrl.close();
            }, function(error) {
                toast.open(error);
            });
        },

        // 复制链接
        copyLink: function() {
            if(window.cordova && window.cordova.plugins) {
                cordova.plugins.clipboard.copy(shareData.url, function() {
                    toast.open('复制成功');
                }, angular.noop);
            }
        },

        // 关闭弹层
        close: function() {
            modals.shareEvent.close();
        }
    });

    ctrl.init();

});
