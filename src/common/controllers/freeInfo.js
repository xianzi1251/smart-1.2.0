angular.module('app.controllers').controller('freeInfoCtrl', function(
    $scope, $state, nativeTransition, errorHandling, productService, loadDataMixin,
    toast, errorHandling, $stateParams, stateUtils, $sce
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        genreName: $stateParams.genreName,

        // angular使用音频播放器需要做特殊处理
        videoUrl: ($stateParams.genreName == 'radio') ? $sce.trustAsResourceUrl($stateParams.videoUrl) : $stateParams.videoUrl,

        // 默认可卖
        sellAbled: true,

        // 获取套装商品信息
        loadData: function() {
            return productService.getProductInfo(ctrl.entityName, ctrl.genreName)
                .success(function(response) {

                    // 获取套装商品作者介绍
                    if (response.list[0].length) {

                        ctrl.baseData = response.list[0][0];

                        // 图片
                        ctrl.baseData.picUrl = window.APP_CONFIG.serviceAPI + ctrl.baseData.picUrl;

                        // 商品可卖
                        ctrl.sellAbled = true;

                    } else {
                        toast.open('商品已下架');

                        // 商品不可卖
                        ctrl.sellAbled = false;
                    }
                })
                .error(errorHandling);
        }
        
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });
});
