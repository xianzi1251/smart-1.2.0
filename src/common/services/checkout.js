/**
 * 结算服务
 */
angular.module('app.services').factory('checkoutService', function(
    api, messageCenter
) {

    return {

        /**
         * 结算页商品信息
         */
        getItems: function(ordItemIds) {
            return api.post('/cosmos.json?command=config.order', {
                    proName: 'shoppingCart',
                    ordItemIds: ordItemIds,
                    cart: false
                });
        },

        /**
         * 提交订单
         */
        creatOrder: function(ordItemIds, payment, payableAmount, needInvoice, invType, invoiceType, invoiceTitle, taxpayerNo, invoiceEmail, invoiceContent) {
            return api.post('/cosmos.json?domain=config', {
                    proName: 'creatOrder',
                    userId: window.APP_USER.id,
                    appversion: '2.1',
                    command: 'order',
                    submit: true,
                    cart: false,
                    submitEvent: 'submitOrder',
                    ordItemIds: ordItemIds,
                    termsName: payment,
                    needInvoice: needInvoice,
                    invType: invType,
                    invoiceType: invoiceType,
                    invoiceTitle: invoiceTitle,
                    taxpayerNo: taxpayerNo,
                    invoiceEmail: invoiceEmail,
                    invoiceContent: invoiceContent
                })
                .success(function() {
                    // 广播消息 生成订单后，刷新购物车数据
                    messageCenter.publishMessage('checkout.success', {
                        payableAmount: payableAmount
                    });
                });
        },

        /**
         * 支付成功后，访问
         */
        payOrderSuccessCallback: function(orderId) {
            return api.post('/cosmos.json?command=scommerce.BS_PAY_PAYMENT_CALLBACK', {
                    proName: 'BS_PAY_PAYMENT_CALLBACK',
                    orderId: orderId
                });
        },

        /**
         * 提交订单后，在订单列表／订单详情页重新支付时，需要先修改该订单的支付方式
         */
        choosePayment: function(orderId, termsName) {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_CHANGE_PAYTYPE', {
                    proName: 'BYT_ORD_CHANGE_PAYTYPE',
                    orderId: orderId,
                    termsName: termsName
                });
        }

    };
});
