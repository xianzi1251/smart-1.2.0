angular.module('app.services').factory('indexService', ['api',function(api, messageCenter) {

	return {
		
		/**
		 * 获取首页信息
	     * @param positionName
	     * 平台导师: 1482333642009
	     * 轮播图片: 1479108028003
	     * 精品推荐: 1482333476320
         * 套装推荐：1494125330508
	     * 底部广告：1482796079692
		 */
		getIndexInfo: function(positionName) {
            return api.post('/cosmos.json?command=scommerce.BYT_ADV_ADVERTISEMENT_INNERLIST', {
                    proName: 'BYT_ADV_ADVERTISEMENT_INNERLIST',
                    positionName: positionName
                });
        },

        /**
		 * 点赞
	     * @param advId 
		 */
		userLike: function(advId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ADV_USER_HIT', {
                    proName: 'BYT_ADV_USER_HIT',
                    advId: advId
                })
            	.success(function() {
            		messageCenter.publishMessage('like.success');
            	});
        }
	};
}]);