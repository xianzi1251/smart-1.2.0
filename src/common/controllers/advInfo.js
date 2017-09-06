angular.module('app.controllers').controller('advInfoCtrl', function(
    $scope, $stateParams, loadDataMixin, errorHandling, advService, api, toast
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        id: $stateParams.id,

        // 是否展示title和日期
        from: $stateParams.from,

        // 获取数据
        loadData: function () {
            ctrl.finishLoading = false;

            // 电子书页面是否显示分享按钮
            ctrl.showShareBtn = false;

            // 广告详情
            ctrl.adv = {};

            return advService.getAdvInfo(ctrl.id)
                .success(function(response) {

                    if (!response.list[0][0]) {
                        return;
                    } else {
                        ctrl.adv = response.list[0][0];

                        // 转义返回的文描html
                        ctrl.adv.content = _.unescape(ctrl.adv.content);

                        // 显示分享按钮
                        ctrl.showShareBtn = true;
                    }

                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        },

        // 点击分享按钮
        shareInfo: function() {

            var shareData = {
                title: ctrl.adv.label,
                content: ctrl.adv.label,
                pic: window.APP_CONFIG.serviceAPI + ctrl.adv.picUrl,
                url: window.APP_CONFIG.serviceAPI + ctrl.adv.linkUrl
            };

            if (window.umeng && window.umeng.share) {
                ctrl.share(shareData).then(function(platform) {
                    // 分享成功回调,可根据不同平台做相应处理
                    toast.open('分享成功');
                }).error(function() {
                    // 分享失败回调
                    toast.open('分享失败');
                });
            }
        },

        // 插件实现分享分享
        share: function(data) {

            var deferred = api.defer();

            window.umeng.share(data.title, data.content, data.pic, data.url, function(platform) {
                deferred.resolve(platform);
            }, function() {
                deferred.reject();
            });

            return deferred.promise;
        }
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});