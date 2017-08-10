angular.module('app.services').factory('videoService', ['api',function(api, messageCenter) {

	return {
		
		/**
		 * 获取观看记录
		 */
        getViewVideoList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_BHV_HISTORY_LIST_BLOCK', {
                    proName: 'BYT_BHV_HISTORY_LIST_BLOCK',
                    pageLimit: 100
                });
        },

        /**
         * 删除观看记录
         */
        deleteVideo: function(summaryIds) {
            return api.post('/cosmos.json?command=scommerce.BYT_BHV_SUMMARY_DELETE', {
                    proName: 'BYT_BHV_SUMMARY_DELETE',
                    summaryIds: summaryIds
                });
        }
	};
}]);