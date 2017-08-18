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
         * 获取分类信息
         */
        getMallSort: function(pageLimit) {
            return api.post('/cosmos.json?command=scommerce.BYT_CHILD_CATEGORY_GET', {
                    proName: 'BYT_CHILD_CATEGORY_GET',
                    categoryName: 'book',
                    pageLimit: pageLimit
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
        },

        /**
         * 获取分类列表页／搜索列表页数据
         */
        getMallProductList: function(keyword, categoryName, sort) {
            return api.post('/cosmos.json?command=config.querySku', {
                    proName: 'getMallProductList',
                    page: 1,
                    pageLimit: 1000,
                    q: keyword,
                    fq: 'parentCategoryName:' + categoryName,
                    sort: sort
                });
        },

        /**
         * 获取商品详情
         */
        getMallProductInfo: function(entityName) {
            return api.post('/cosmos.json?command=scommerce.BYT_CDT_COMMODITY_GET_BLOCK4MVVM', {
                    proName: 'BYT_CDT_COMMODITY_GET_BLOCK4MVVM',
                    historyLogEnabled: true,
                    commodityName: entityName
                });
        },

        /**
         * 获取商品详情中的图片轮播
         */
        getMallProductInfoSliders: function(entityName) {
            return api.post('/cosmos.json?domain=scommerce&command=NB_SKU_ASSET_BLOCK', {
                    proName: 'NB_SKU_ASSET_BLOCK',
                    entityName: entityName
                });
        }
	};
}]);