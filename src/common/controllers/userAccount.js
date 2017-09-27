angular.module('app.controllers').controller('userAccountCtrl', function(
    $scope, loadDataMixin, loading, errorHandling, toast, userAccountService, stateUtils,
    nativeTransition, $state, userService, modals, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 获取数据
        loadData: function() {

            loading.open();

            ctrl.finishLoading = false;

            ctrl.accountBalance = 0;

            return userAccountService.getAccountBalance()
                .success(function(response) {
                    ctrl.accountBalance = response.object.balance;
                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();

                    ctrl.finishLoading = true;
                });         
        },

        // 获取iap商品集合
        getProducts: function() {

            loading.open();

            ctrl.finishProductsLoading = false;

            ctrl.finishProductsIAPLoading = false;

            userAccountService.getIapProducts()
                .success(function(response) {

                    ctrl.products = response.list[0];

                    var productIds = [];
                    _.forEach(ctrl.products, function(product) {
                        productIds.push(product.productId);

                        product.active = false;

                        if (product.default) {
                            ctrl.rechargeAccount = product.title;

                            ctrl.activeProductId = product.productId;

                            product.active = true;
                        }
                    });

                    if (window.inAppPurchase) {

                        inAppPurchase.getProducts(productIds)
                            .then(function (iapProducts) {
                                // console.log('iapProducts', iapProducts);
                                ctrl.finishProductsIAPLoading = true;
                                loading.close();
                            })
                            .catch(function (err) {
                                // console.log('getProducts-error', err);
                                loading.close();
                            });
                    } else {
                        loading.close();
                    }
                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishProductsLoading = true;
                });
        },

        // 选择
        selected: function(product) {
            if (product.productId != ctrl.activeProductId) {

                _.forEach(ctrl.products, function(item) {
                    item.active = false;
                });

                ctrl.rechargeAccount = product.title;

                ctrl.activeProductId = product.productId;

                product.active = true;
            }
        },

        // 确定充值支付
        submit: function() {
            userService.hasLogined()
                .success(function() {
                    ctrl.goToRecharge();
                })
                .error(function() {

                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                ctrl.init();
                                ctrl.getProducts();
                            }, e.scope);
                        });
                });
        },

        // 去充值
        goToRecharge: function() {

            if (window.inAppPurchase) {

                if (!ctrl.finishProductsIAPLoading) {
                    toast.open('正在连接itunes，请稍等');
                    return;
                }

                loading.open();

                var productId = ctrl.activeProductId;
                    
                inAppPurchase.buy(productId)
                    .then(function (data) {
                        // console.log(JSON.stringify(data));
                        // console.log('consuming transactionId: ' + data.transactionId);

                        var receipt = data.receipt;

                        // 访问接口
                        userAccountService.getBalanceId(productId, receipt)
                            .success(function(response) {
                                var balanceId = response.object.balanceId;
                                var passKey = response.object.passKey;

                                userAccountService.recharge(receipt, balanceId, passKey)
                                    .success(function(response) {
                                        if (response.result == 1) {
                                            // 刷新页面
                                            ctrl.init();

                                            // iap内部方法-android需要调用该方法
                                            // return inAppPurchase.consume(data.type, data.receipt, data.signature);
                                        } else {
                                            toast.open(response.message);
                                        }
                                    })
                                    .error(errorHandling)
                                    .finally(function() {
                                        // console.log('consume done!');

                                        loading.close();
                                    });
                            })
                            .error(errorHandling)
                            .error(function() {
                                loading.close();
                            });
                    })
                    .catch(function (err) {
                        // console.log('buy-error', err);

                        toast.open(err.errorMessage);

                        loading.close();
                    });
            } 
        },

        // 绑定支付宝
        goBindAlipay: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('userAccountBindAlipay');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 绑定微信
        goBindWechat: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('userAccountBindWechat');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 绑定银行卡
        goBindBankCard: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('userAccountBindBankCard');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 去购买记录
        goAccountList: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('userAccountPurchasedList');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 去我的订单
        goOrderList: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('orderList');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 去购物车
        goShoppingCart: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('shoppingCart');
            nativeTransition.forward();
            $state.go(stateName);
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        ctrl.getProducts();
        deregistration();
    });

});
