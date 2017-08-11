/**
 * 封装订单接口
 */
angular.module('app.services').factory('orderService',function(
    api, messageCenter
) {
    return {

        /**
         * 获取订单列表
         * orderState 订单状态 ［空：全部订单；‘finish’：已完成的订单］
         */
    	getOrderList: function(orderState) {
    		return api.post('/cosmos.json?command=scommerce.BYT_ACC_ACCOUNT_ORDER_LIST_BLOCK', {
                proName: 'BYT_ACC_ACCOUNT_ORDER_LIST_BLOCK',
                userId: window.APP_USER.id,
                orderState: orderState,
                pageLimit: 9999
            });
    	},

        /**
         * 获取订单中的订单项
         * orderState 订单状态 ［空：全部订单项；‘finish’：已完成的订单项］
         */
        getOrderItems: function (orderState) {
            return api.post('/cosmos.json?command=scommerce.BYT_ACC_ORDER_ITEM_LIST', {
                proName: 'BYT_ACC_ORDER_ITEM_LIST',
                userId: window.APP_USER.id,
                orderState: orderState,
                pageLimit: 9999
            });
        },

        /**
         * 获取订单详情
         * orderId 订单id
         */
        getOrderInfo: function (orderId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_ORDER_GET', {
                proName: 'BYT_ORD_ORDER_GET',
                orderId: orderId
            });
        },

        /**
         * 取消订单
         * orderId 订单id
         */
        cancleOrder: function (orderId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_ORDER_CANCEL', {
                proName: 'BYT_ORD_ORDER_CANCEL',
                orderId: orderId
            })
            .success(function() {
                messageCenter.publishMessage('order.cancel');
            });
        },

        /**
         * 获取已购列表－课程
         */
        getPurchasedCourseList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_ORDER_PURCHASE', {
                proName: 'BYT_ORD_ORDER_PURCHASE',
                userId: window.APP_USER.id
            });
        },

        /**
         * 获取已购列表－图书
         */
        getPurchasedBookList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_ACC_ORDER_ITEMBOOK_LIST', {
                proName: 'BYT_ACC_ORDER_ITEMBOOK_LIST'
            });
        }
    };
});
