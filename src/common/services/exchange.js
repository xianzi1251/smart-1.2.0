/**
 * 封装积分兑换接口
 */
angular.module('app.services').factory('exchangeService',function(
    api, messageCenter
) {
    return {

        /**
         * 获取积分兑换列表
         */
        getExchangeList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_LYT_EXCHANGESETTINGS_LIST', {
                proName: 'BYT_LYT_EXCHANGESETTINGS_LIST',
                pageLimit: 9999,
                page: 1
            });
        },

        /**
         * 兑换积分
         */
        exchange: function(exchageId) {
            return api.post('/cosmos.json?command=scommerce.BYT_LYT_EXCHANGE_BLOCK', {
                proName: 'BYT_LYT_EXCHANGE_BLOCK',
                exchageId: exchageId
            })
            .success(function() {
                messageCenter.publishMessage('exchange.success');
            });
        },

        /**
         * 获取积分兑换视频列表
         */
        getExchangeVideoList: function(exchangeId) {
            return api.post('/cosmos.json?command=scommerce.BYT_LYT_EXCHANGESETTINGS_BYEXID', {
                proName: 'BYT_LYT_EXCHANGESETTINGS_BYEXID',
                pageLimit: 9999,
                page: 1,
                exchangeId: exchangeId
            });
        },

        /**
         * 获取兑换码视频列表
         */
        getExchangeCodeVideoList: function(exusedId) {
            return api.post('/cosmos.json?command=scommerce.BYT_CODE_EXCHANGESETTINGS_BYEXID', {
                proName: 'BYT_CODE_EXCHANGESETTINGS_BYEXID',
                pageLimit: 9999,
                page: 1,
                exusedId: exusedId
            });
        },

        /**
         * 兑换码
         */
        exchangeCode: function(excode) {
            return api.post('/cosmos.json?command=scommerce.BYT_CODE_EXCHANGE_ACTION', {
                proName: 'BYT_CODE_EXCHANGE_ACTION',
                excode: excode
            });
        },

        /**
         * 兑换码列表
         */
        exchangeCodeList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_CODE_EXCHANGED_LIST', {
                proName: 'BYT_CODE_EXCHANGED_LIST',
                pageLimit: 9999,
                page: 1
            });
        }
    };
});
