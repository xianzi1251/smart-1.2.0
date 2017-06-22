angular.module('app.services').factory('advService', ['api',function(api, messageCenter) {

	return {
		
		/**
		 * 获取广告列表页
	     * @param positionName
	     * 时政: 1483425657036
	     * 苏北: 1483458340025
	     * 电子: 1483435590039
	     * 图书：?
		 */
        getAdvList: function(positionName) {
            return api.post('/cosmos.json?command=scommerce.BS_ADV_ADVERTISEMENT_INNERLIST', {
                    proName: 'BS_ADV_ADVERTISEMENT_INNERLIST',
                    positionName: positionName
                });
        },

        /**
		 * 获取广告详情页
	     * @param advertisementId
		 */
        getAdvInfo: function(advertisementId) {
            return api.post('/cosmos.json?command=scommerce.SC_ADV_ADVERTISEMENT_GET', {
                    proName: 'SC_ADV_ADVERTISEMENT_GET',
                    advertisementId: advertisementId
                });
        }
	};
}]);