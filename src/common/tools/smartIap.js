/**
 * iap
 */
angular.module('app.services').factory('smartIap', function(
    $rootScope, userAccountService, errorHandling, loading, messageCenter, toast
) {

    return {

        // 初始化store
        initStore: function() {

            // 日志输出
            // store.verbosity = store.DEBUG;

            // 校验
            store.validator = function(product, callback) {

                loading.open();

                var receipt = product.transaction.appStoreReceipt,
                    productId = product.id;

                // 访问接口
                userAccountService.getBalanceId(productId, receipt)
                    .success(function(response) {
                        var balanceId = response.object.balanceId;
                        var passKey = response.object.passKey;

                        userAccountService.recharge(receipt, balanceId, passKey)
                            .success(function(response) {
                                if (response.result == 1) {

                                    // 充值完成，广播修改余额
                                    messageCenter.publishMessage('recharge.success');

                                    // 结束事务
                                    product.finish();

                                    callback(true, {}); // success! 

                                } else {
                                    loading.close();

                                    toast.open(response.message);

                                    callback(false, 'Validation Failed.');
                                }
                            })
                            .error(errorHandling)
                            .error(function() {
                                loading.close();

                                callback(false, 'Validation Failed.');
                            });
                    })
                    .error(errorHandling)
                    .error(function() {
                        loading.close();

                        callback(false, 'Validation Failed.');
                    });
            };

            // 从接口中获取productId
            getProducts();

            // 监听product变化
            // store.when('product').updated(function (product) {
            //     console.log('product update', product);
            // });

            // 监听购买完成，校验票据是否正确
            store.when('product').approved(function (product) {
                product.verify();
            });

            // 监听校验完成后，结束事务
            store.when('product').verified(function (product) {
                // console.log('product verified', product);
            });

            // 监听用户取消操作
            store.when('product').cancelled(function (product) {
                toast.open('取消支付');

                loading.close();
            });

            // 异常处理
            store.error(function(error) {
                toast.open(error.message);

                loading.close();
            });

            // 刷新，检查是否有未完成的事务
            store.refresh();
        },

        // 去充值
        recharge: function() {
            loading.open();

            store.order($rootScope.activeProductId);
        }
    };

    // 获取products
    function getProducts() {
        userAccountService.getIapProducts()
            .success(function(response) {

                $rootScope.productsInIAP = response.list[0];

                _.forEach($rootScope.productsInIAP, function(product) {

                    // 注册product
                    store.register({
                        id: product.productId,
                        type: store.CONSUMABLE
                    });

                    // 充值界面显示
                    product.active = false;
                    if (product.default) {
                        $rootScope.rechargeAccount = product.title;

                        $rootScope.activeProductId = product.productId;

                        product.active = true;
                    }
                });
            })
            .error(errorHandling);
    }
});
