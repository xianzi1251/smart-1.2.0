angular.module('app.services').factory('couponService', ['api',function(api) {

	return {
		
		/**
		 * 结算中心－获取所有可使用的优惠券列表
		 */
        getAllCouponList: function() {
            return api.post('/cosmos.json?domain=scommerce&command=BS_CPN_PRIVATECODE_GET_BLOCK', {
                    proName: 'BS_CPN_PRIVATECODE_GET_BLOCK'
                });
        },

        /**
		 * 结算中心－获取当前结算中可使用的优惠券列表
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
         * 结算中心－选中优惠券
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
        },

        /**
         * 会员中心－优惠券列表
         * @param    c1State(0-未使用/1-已使用/2-已过期)
         */
        list: function(c1State) {
            return api.post('/cosmos.json?command=scommerce.BYT_CPN_CODE_LIST_BLOCK', {
                    proName: 'BYT_CPN_CODE_LIST_BLOCK',
                    pageLimit: 100,
                    c1State: c1State
                });
        }
	};
}]);