angular.module('app.controllers').controller('mallSearchListCtrl', function(
    $scope, $state, nativeTransition, errorHandling, loadDataMixin, mallService, loading, 
    $ionicScrollDelegate, stateUtils
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 搜索关键字
        keyword: '',

        // 跳转商品详情
        goMallProductInfo: stateUtils.goMallProductInfo,

        // 去购物车
        goShoppingCart: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('shoppingCart');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 搜索商品
        search: function() {
            $ionicScrollDelegate.$getByHandle('mallSearchListScroll').scrollTop(true);

            ctrl.refresh();

            if (window.cordova && window.cordova.plugins){
                cordova.plugins.Keyboard.close();
            }
        },

        // 获取数据
        loadData: function() {
            ctrl.finishLoading = false;
            loading.open();

            ctrl.items = [];

            return mallService.getMallProductList(ctrl.keyword, '', '')
                .success(function(response) {
                    ctrl.items = response.results.list;

                    _.forEach(ctrl.items, function(item) {
                        item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                    });
                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                    loading.close();
                });
        }

    });

    // 页面进入时重置搜索关键字
    $scope.$on('$ionicView.beforeEnter', function() {
        ctrl.keyword = '';
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
