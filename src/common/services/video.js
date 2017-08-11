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
        deleteViewVideo: function(summaryIds) {
            return api.post('/cosmos.json?command=scommerce.BYT_BHV_SUMMARY_DELETE', {
                    proName: 'BYT_BHV_SUMMARY_DELETE',
                    summaryIds: summaryIds
                });
        },

        /**
         * 获取视频下载记录
         */
        getDownloadVideoList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_VIDEO_CACHE_LISTBLOCK', {
                    proName: 'BYT_VIDEO_CACHE_LISTBLOCK'
                });
        },

        /**
         * 删除视频下载记录
         */
        deleteDownloadVideo: function(cacheIds) {
            return api.post('/cosmos.json?command=scommerce.BYT_VIDEO_CACHE_DELETE', {
                    proName: 'BYT_VIDEO_CACHE_DELETE',
                    cacheIds: cacheIds
                });
        }
	};
}]);