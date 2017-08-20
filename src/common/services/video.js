angular.module('app.services').factory('videoService', ['api',function(api, messageCenter, localStorage) {

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
                    proName: 'BYT_VIDEO_CACHE_LISTBLOCK',
                    deviceId: localStorage.get('unique') || APP_CONFIG.unique
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
        },

        /**
         * 根据deviceId删除视频下载全部记录
         */
        deleteAllCachedVideo: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_VIDEO_CACHE_DELETEBYDEVICEID', {
                    proName: 'BYT_VIDEO_CACHE_DELETEBYDEVICEID',
                    deviceId: localStorage.get('unique') || APP_CONFIG.unique
                });
        },

        /**
         * 下载视频
         */
        downloadVideo: function(commodityId, videoPath) {
            return api.post('/cosmos.json?command=scommerce.BYT_VIDEO_CACHE_SAVE', {
                    proName: 'BYT_VIDEO_CACHE_SAVE',
                    deviceId: localStorage.get('unique') || APP_CONFIG.unique,
                    commodityId: commodityId,
                    videoPath: videoPath
                });
        }
    };
}]);