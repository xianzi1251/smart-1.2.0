/**
 * 封装评论接口
 */
angular.module('app.services').factory('commentService',function(
    api, messageCenter
) {
    return {

        /**
         * 点评订单的商品
         * orderItemId     订单项id
         * entityId        商品skuId
         * entity          'sku'
         * dimensionScore   分数
         * commentType     'comments'
         * content          评论内容
         * title            商品title
         */
        submitComment: function (orderItemId, entityId, entity, dimensionScore, commentType, content, title) {
            return api.post('/cosmos.json?command=scommerce.BYT_CMT_COMMENT_PUBLISH_ACTION', {
                proName: 'BYT_CMT_COMMENT_PUBLISH_ACTION',
                orderItemId: orderItemId,
                entityId: entityId,
                entity: entity,
                dimensionScore: dimensionScore,
                commentType: commentType,
                content: content,
                title: title
            })
            .success(function() {
                messageCenter.publishMessage('order.comment');
            });
        },

        /**
         * 获取商品的点评列表
         * commodityName   商品
         */
        getComments: function (commodityName) {
            return api.post('/cosmos.json?command=scommerce.BYT_CMT_COMMENT_REPLY_GET', {
                proName: 'BYT_CMT_COMMENT_REPLY_GET',
                commodityName: commodityName,
                entity: 'commodity',
                userId: window.APP_USER.id
            });
        }
    };
});
