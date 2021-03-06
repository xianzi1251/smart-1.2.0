angular.module('app.controllers').controller('mallProductInfoCtrl', function(
    $scope, $state, toast, modals, $stateParams, loadDataMixin, commentService, nativeTransition,
    mallService, errorHandling, userService, messageCenter, cartService, stateUtils
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

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

        // 默认可卖
        sellAbled: true,

        // 获取商品信息
        loadData: function() {
            ctrl.sliderList = [];
            return mallService.getMallProductInfo(ctrl.entityName)
                .success(function(response) {

                    // 获取商品信息
                    if (response.list[0].length) {

                        // 快递公司
                        ctrl.expressCompany = response.object.expressCompany;

                        ctrl.baseData = response.list[0][0];

                        // 图片
                        ctrl.baseData.picUrl = window.APP_CONFIG.serviceAPI + ctrl.baseData.picUrl;

                        // 转义返回的文描html
                        ctrl.baseData.content = _.unescape(ctrl.baseData.content);

                        // 商品可卖
                        ctrl.sellAbled = true;

                        // 获取商品详情轮播图
                        mallService.getMallProductInfoSliders(ctrl.entityName)
                            .success(function(response) {
                                ctrl.sliderList = response.list[0];

                                _.forEach(ctrl.sliderList, function(slider) {
                                    slider.picUrl = window.APP_CONFIG.serviceAPI + slider.picUrl;
                                });
                            })
                            .error(errorHandling);

                    } else {
                        toast.open('商品已下架');

                        // 商品不可卖
                        ctrl.sellAbled = false;
                    }

                    // 获取商品评论
                    commentService.getComments(ctrl.entityName)
                        .success(function(response) {
                            if (response.list[0].length) {
                                ctrl.commentsList = response.list[0];
                            }
                        })
                        .error(errorHandling);
                })
                .error(errorHandling);
        },

        // 添加购物车
        addToCart: function () {

            userService.hasLogined()
                .success(function() {

                    cartService.addToCart(ctrl.baseData.sku)
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

        // 购买
        buyNow: function () {

            userService.hasLogined()
                .success(function() {

                    modals.buyNow.open({
                        params: {
                            item: ctrl.baseData
                        }
                    });

                })
                .error(function() {
                    
                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                ctrl.init();
                            }, e.scope);
                        });

                });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
