angular.module('app.controllers').controller('videoInfoCtrl', function(
    $scope, $stateParams, productService, toast, commentService, errorHandling, loadDataMixin, $sce
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        // angular使用音频播放器需要做特殊处理
        videoUrl: ($stateParams.genreName == 'radio') ? $sce.trustAsResourceUrl($stateParams.videoUrl) : $stateParams.videoUrl,

        genreName: $stateParams.genreName,

        // 默认可卖
        sellAbled: true,

        // 获取商品信息
        loadData: function() {
            return productService.getProductVideo(ctrl.entityName)
                .success(function(response) {

                    // 获取商品信息
                    if (response.list[0].length) {

                        ctrl.baseData = response.list[0][0];

                        // 图片
                        ctrl.baseData.picUrl = window.APP_CONFIG.serviceAPI + ctrl.baseData.picUrl;

                        // 转义返回的文描html
                        ctrl.baseData.content = _.unescape(ctrl.baseData.content);

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
