angular.module('app.controllers').controller('freeListCtrl', function(
    $scope, $state, nativeTransition, errorHandling, productService, loadDataMixin,
    toast, errorHandling, $stateParams, stateUtils
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        // 获取套装商品信息
        loadData: function() {
            ctrl.finishLoading = false;
            return productService.getSuitFreeCourses(ctrl.entityName)
                .success(function(response) {

                    // 获取套装商品作者介绍
                    if (response.list[0].length) {

                        ctrl.courseList = response.list[0];

                        _.forEach(ctrl.courseList, function(item) {
                            // 图片
                            item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                        });

                    }
                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        },

        // 去免费试读详情页
        goFreeInfo: function(entityName, genreName, videoUrl) {
            var stateName = stateUtils.getStateNameByCurrentTab('freeInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                entityName: entityName,
                genreName: genreName,
                videoUrl: videoUrl
            });
        }
        
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });
});
