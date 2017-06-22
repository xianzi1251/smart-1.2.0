angular.module('app.controllers').controller('choosePaymentCtrl', function(
    $scope, api, toast, $params, modals, payService, messageCenter, errorHandling, checkoutService
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 订单id
        orderId: $params.orderId,

        // 关闭弹窗
        close: function () {
            modals.choosePayment.close();
        },

        // 去支付
        goPay: function (termsName) {
            var orderId = ctrl.orderId,
                termsName = termsName;

            // 需要先修改该订单的支付方式
            checkoutService.choosePayment(orderId, termsName)
                .success(function() {
                    // 广播消息 修改支付方式完成
                    messageCenter.publishMessage('chooosepayment.success');

                    ctrl.close();

                    // 去支付
                    payService.pay(orderId, termsName)
                        .success(function() {

                            // 开启支付成功页面
                            modals.paymentOrderSuccess.open({
                                params: {
                                    orderId: ctrl.orderId
                                }
                            });

                            // 广播消息 支付完成
                            messageCenter.publishMessage('pay.success');

                        })
                        .error(errorHandling);

                })
                .error(errorHandling);
                    
        }

    });

});
