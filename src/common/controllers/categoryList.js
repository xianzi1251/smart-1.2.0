angular.module('app.controllers').controller('categoryListCtrl', function(
    $scope, api, $stateParams, stateUtils, categoryService, errorHandling, loading, $ionicScrollDelegate
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 跳转商品详情
        goProductInfo: stateUtils.goProductInfo,

        categoryName: $stateParams.categoryName,

        categoryTitle: $stateParams.categoryTitle,

        // 获取数据
        init: function() {
            loading.open();
            ctrl.finishLoading = false;

            // 获取数据
            categoryService.getCategorylist(ctrl.categoryName)
                .success(function(response) {

                    // tab栏内容
                    var infoTabs = response.list[0];
                    _.forEach(infoTabs, function(item, $index) {
                        if ($index == 0) {
                            item.active = true;
                        } else {
                            item.active = false;
                        }
                    });
                    ctrl.infoTabs = infoTabs;

                    // 第一个分类的商品列表
                    var infoItems = response.list[1];
                    if (infoItems) {
                        _.forEach(infoItems, function(item) {
                            item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                        });
                    }
                    ctrl.infoItems = infoItems;

                    // 第一个tab的分类id
                    ctrl.activeCategoryId = ctrl.infoTabs[0].categoryId;

                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                    ctrl.finishLoading = true;
                });
        },

        // 切换tab
        changeTab: function(categoryId, index) {

            // 当前tab修改
            _.forEach(ctrl.infoTabs, function(item, $index) {
                if (index == $index) {
                    item.active = true;
                } else {
                    item.active = false;
                }
            });

            // 当前tab的分类id
            ctrl.activeCategoryId = categoryId;

            // 获取当前tab的商品集合
            ctrl.getItems();

            // 分类置顶
            $ionicScrollDelegate.$getByHandle('categoryListScroll').scrollTop();
        },

        // 根据当前的分类id获取当前的商品集合
        getItems: function() {
            loading.open();

            categoryService.getCategoryItem(ctrl.activeCategoryId)
                .success(function(response) {

                    // 商品列表
                    var infoItems = response.list[0];
                    if (infoItems) {
                        _.forEach(infoItems, function(item) {
                            item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                        });
                    }
                    ctrl.infoItems = infoItems;

                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                });

            // 停止广播ion-refresher
            $scope.$broadcast('scroll.refreshComplete');
        }

    });

	var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
