angular.module('app.controllers').controller('courseAudioCtrl', function(
    $scope, $stateParams, stateUtils, errorHandling, loadDataMixin, productService
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        // 跳转音频／视频详情
        goVideoInfo: stateUtils.goVideoInfo,

        // 获取数据
        loadData: function() {

            ctrl.finishLoading = false;

            // 获取套装商品的相关课程
            return productService.getSuitCourses(ctrl.entityName)
                .success(function(response) {
                    if (response.list[0].length) {
                        ctrl.courseList = response.list[0];

                        _.forEach(ctrl.courseList, function(item) {
                            item.picUrl = window.APP_CONFIG.serviceAPI + item.hpicUrl;
                        });
                    }
                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
