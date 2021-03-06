angular.module('app.controllers').controller('productInfoCtrl', function(
    $scope, toast, modals, $stateParams, loadDataMixin, commentService, stateUtils, nativeTransition,
    productService, errorHandling, userService, messageCenter, cartService, $state
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        // 默认可卖
        sellAbled: true,

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

        // 获取商品信息
        loadData: function() {
            return productService.getProductInfo(ctrl.entityName)
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
