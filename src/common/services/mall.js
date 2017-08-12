angular.module('app.services').factory('mallService', ['api',function(api, messageCenter) {

	return {

        /**
         * 获取首页轮播图
         */
        getMallIndexSlider: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_ADV_ADVERTISEMENT_INNERLIST', {
                    proName: 'BYT_ADV_ADVERTISEMENT_INNERLIST',
                    positionName: '1500975764881'
                });
        },

        /**
         * 获取首页分类信息
         */
        getMallIndexSort: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_CHILD_CATEGORY_GET', {
                    proName: 'BYT_CHILD_CATEGORY_GET',
                    categoryName: '1501745201586',
                    pageLimit: 4
                });
        },
		
		/**
		 * 获取首页楼层名称
		 */
        getMallIndexFloorTitle: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_SHOP_INDEX_POSITION_BLOCK', {
                    proName: 'BYT_SHOP_INDEX_POSITION_BLOCK'
                });
        },

        /**
         * 获取首页楼层数据
         */
        getMallIndexFloorData: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_SHOP_INDEX_BLOCK', {
                    proName: 'BYT_SHOP_INDEX_BLOCK'
                });
        }
	};
}]);