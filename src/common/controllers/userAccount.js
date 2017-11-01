angular.module('app.controllers').controller('userAccountCtrl', function(
    $scope, loadDataMixin, loading, errorHandling, toast, userAccountService, stateUtils,
    nativeTransition, $state, userService, modals, messageCenter, $rootScope, smartIap
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

        // 选择
        selected: function(product) {
            if (product.productId != $rootScope.activeProductId) {

                _.forEach($rootScope.productsInIAP, function(item) {
                    item.active = false;
                });

                $rootScope.rechargeAccount = product.title;

                $rootScope.activeProductId = product.productId;

                product.active = true;
            }
        },

        // 确定充值支付
        submit: function() {
            userService.hasLogined()
                .success(function() {
                    smartIap.recharge();
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
        deregistration();
    });

    // 监听充值成功 刷新列表
    messageCenter.subscribeMessage('recharge.success', function() {
        ctrl.init();
    });

});
