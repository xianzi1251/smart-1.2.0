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
        creatOrder: function(ordItemIds, paymentName, addressId) {
            return api.post('/cosmos.json?domain=config', {
                    proName: 'creatOrder',
                    userId: window.APP_USER.id,
                    ordItemIds: ordItemIds,
                    termsName: paymentName,
                    command: 'order',
                    submit: true,
                    cart: false,
                    submitEvent: 'submitOrder',
                    addressId: addressId
                })
                .success(function() {
                    // 广播消息 生成订单后，刷新购物车数据
                    messageCenter.publishMessage('checkout.success');
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
