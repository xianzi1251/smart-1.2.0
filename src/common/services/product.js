angular.module('app.services').factory('productService', ['api', function(
    api, localStorage
) {
	var productService = {
        
        /**
         * 获取商品详情
         */
        getProductInfo: function(entityName) {
            return api.post('/cosmos.json?command=scommerce.BYT_CDT_COMMODITY_GET_BLOCK4MVVM', {
                    proName: 'BYT_CDT_COMMODITY_GET_BLOCK4MVVM',
                    historyLogEnabled: true,
                    commodityName: entityName
                });
        },

        /**
         * 获取套装商品所有相关课程
         */
        getSuitCourses: function(id) {
            return api.post('/cosmos.json?command=scommerce.BYT_CDT_COMMODITY_TAOCAN_BLOCK', {
                    proName: 'BYT_CDT_COMMODITY_TAOCAN_BLOCK',
                    commodityName: id,
                    deviceId: localStorage.get('unique') || APP_CONFIG.unique
                });
        },

        /**
         * 获取套装商品中可免费试读
         */
        getSuitFreeCourses: function(id) {
            return api.post('/cosmos.json?command=scommerce.BYT_CDT_COMMODITY_FREE_BLOCK', {
                    proName: 'BYT_CDT_COMMODITY_FREE_BLOCK',
                    commodityName: id
                });
        },

        /**
         * 获取视频
         */
        getProductVideo: function(id) {
            return api.post('/cosmos.json?command=scommerce.BYT_CDT_COMMODITY_GET_BUY', {
                    proName: 'BYT_CDT_COMMODITY_GET_BUY',
                    commodityName: id
                });
        }
    };

    return productService;
}]);
