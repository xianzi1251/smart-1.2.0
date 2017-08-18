angular.module('app.controllers').controller('mallIndexCtrl', function(
    $scope, $state, loadDataMixin, nativeTransition, errorHandling, mallService, loading,
    stateUtils, userService, cartService, toast, modals, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 跳转广告详情页
        goAdvInfo: stateUtils.goAdvInfo,

        // 跳转商品详情
        goMallProductInfo: stateUtils.goMallProductInfo,

        // 轮播图跳转
        goSliderAdv: function(item) {
            var type = item.advType;

            if (type == 'html') {
                // 跳转到广告详情页
                ctrl.goAdvInfo(item.id);

            } else if (type == 'entity') {
                // 跳转至图书详情页
                ctrl.goMallProductInfo(item.entityName);
                
            } else if (type == 'link' && item.linkUrl.indexOf('http') != -1) {
                // 跳转至外部连接
                if (window.cordova && window.cordova.InAppBrowser) {
                    window.cordova.InAppBrowser.open(item.linkUrl, '_system');
                } else {
                    window.open(item.linkUrl);
                }
            }
        },

        // 去购物车
        goShoppingCart: function() {

            userService.hasLogined()
                .success(function() {

                    var stateName = stateUtils.getStateNameByCurrentTab('shoppingCart');
                    nativeTransition.forward();
                    $state.go(stateName);

                })
                .error(function() {

                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                ctrl.init();
                            }, e.scope);
                        });

                });
        },

        // 添加购物车
        addToCart: function (item, $event) {

            $event.stopPropagation();

            userService.hasLogined()
                .success(function() {

                    cartService.addToCart(item.sku)
                        .success(function() {
                            toast.open('加入购物车成功')
                        })
                        .error(errorHandling);

                })
                .error(function() {

                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                ctrl.init();
                            }, e.scope);
                        });

                });
        },

        // 获取数据
        loadData: function () {
            ctrl.finishLoading = false;
            loading.open();

            ctrl.sliderList = [];
            ctrl.sortList = [];
            ctrl.floorList = [];

            // 获取轮播数据
            return mallService.getMallIndexSlider()
                .success(function(response) {

                    if (!response.list[0]) {
                        return;
                    } else {
                        ctrl.sliderList = response.list[0];
                    }

                    _.forEach(ctrl.sliderList, function(slider) {
                        slider.picUrl = window.APP_CONFIG.serviceAPI + slider.newPicUrl;
                    });

                    // 获取分类信息，首页取前4条数据
                    var pageLimit = 4;
                    mallService.getMallSort(pageLimit)
                        .success(function(response) {
                            ctrl.sortList = response.list[0];

                            _.forEach(ctrl.sortList, function(item) {
                                item.imageUrl = window.APP_CONFIG.serviceAPI + item.imageUrl;
                            });
                        })
                        .error(errorHandling);

                    // 获取楼层title
                    mallService.getMallIndexFloorTitle()
                        .success(function(response) {

                            var floorList = [];

                            if (!response.list[0]) {
                                return;
                            } else {
                                floorList = response.list[0];
                            }

                            // 获取楼层data
                            mallService.getMallIndexFloorData()
                                .success(function(response) {

                                    var floorItems = response.list;

                                    _.forEach(floorList, function(floor, index) {

                                        floor.items = floorItems[index];

                                        _.forEach(floorItems[index], function(item) {
                                            item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                                        });

                                    });

                                    ctrl.floorList = floorList;

                                })
                                .error(errorHandling)
                                .finally(function() {
                                    ctrl.finishLoading = true;
                                    loading.close();
                                });
                        })
                        .error(errorHandling);
                })
                .error(errorHandling);       
        },

        // 去分类页
        goMallSortList: function(categoryName) {
            nativeTransition.forward();
            $state.go('tabs.mallSortList', {
                categoryName: categoryName
            });
        },

        // 去搜索页
        goSearch: function() {
            nativeTransition.forward();
            $state.go('tabs.mallSearchList');
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
