angular.module('app.services').factory('couponService', ['api',function(api) {

	return {
		
		/**
		 * 获取所有可使用的优惠券列表
		 */
        getAllCouponList: function() {
            return api.post('/cosmos.json?domain=scommerce&command=BS_CPN_PRIVATECODE_GET_BLOCK', {
                    proName: 'BS_CPN_PRIVATECODE_GET_BLOCK'
                });
        },

        /**
		 * 获取当前结算中可使用的优惠券列表
		 */
        getCheckoutCouponList: function(ordItemIds, codes) {
            return api.post('/cosmos.json?domain=config', {
                    proName: 'getCouponList',
                    command: 'order',
                    action: 'applyCoupon',
                    cart: false,
                    submit: false,
                    ordItemIds: ordItemIds,
                    code: codes
                });
        },

        /**
         * 选中优惠券
         */
        chooseCoupon: function(ordItemIds, code) {
            return api.post('/cosmos.json?domain=config', {
                    proName: 'chooseCoupon',
                    command: 'order',
                    action: 'applyCoupon',
                    cart: false,
                    submit: false,
                    ordItemIds: ordItemIds,
                    code: code
                });
        }
	};
}]);