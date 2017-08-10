angular.module('app.controllers').controller('choosePaymentCtrl', function(
    $scope, api, toast, $params, modals, payService, messageCenter, errorHandling, checkoutService
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 订单id
        orderId: $params.orderId,

        // 来源
        source: $params.source,

        // 已选中的支付方式
        selectedPayment: $params.payment,

        // 关闭弹窗
        close: function () {
            modals.choosePayment.close();
        },

        // 选中支付方式
        selected: function(payment) {
            ctrl.selectedPayment = payment;
        },

        /**
         * 确认支付方式
         * source［checkout，此时从结算页，此时仅返回支付方式］
         * source［order，此时从order页，此时需要修改订单的支付方式且也需要去支付］
         */
        confirmPayment: function() {

            var orderId = ctrl.orderId,
                payment = ctrl.selectedPayment,
                source = ctrl.source;

            if (source === 'checkout') {

                // 结算中心，需要返回支付方式
                $params.callback(payment);
                ctrl.close();

            } else if (source === 'order') {

                // 订单中心，需要支付
                ctrl.goPay(orderId, payment); 

            }
        },

        // 去支付
        goPay: function (orderId, payment) {

            // 需要先修改该订单的支付方式
            checkoutService.choosePayment(orderId, payment)
                .success(function() {
                    ctrl.close();

                    // 广播消息 修改支付方式完成
                    messageCenter.publishMessage('chooosepayment.success');

                    payService.pay(orderId, payment)
                        .success(function() {

                            // 开启支付成功页面
                            modals.paymentOrderSuccess.open({
                                params: {
                                    orderId: orderId
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
