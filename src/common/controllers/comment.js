angular.module('app.controllers').controller('commentCtrl', function(
    $scope, toast, $stateParams, commentService, errorHandling, nativeTransition, $state
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 商品信息
        id: $stateParams.id,
        skuId: $stateParams.skuId,
        title: $stateParams.title,
        source: $stateParams.source,

        // 默认分数位5分
        score: 5,

        // 确定提交评论
        submit: function () {

            if (!ctrl.content) {
                toast.open('请填写评论内容');
                return;
            }

            var orderItemId = ctrl.id,
                entityId = ctrl.skuId,
                entity = 'sku',
                dimensionScore = 'productQuality,' + ctrl.score,
                commentType = 'comments',
                content = ctrl.content,
                title = ctrl.title;

            commentService.submitComment(orderItemId, entityId, entity, dimensionScore, commentType, content, title)
                .success(function() {
                    nativeTransition.forward();
                    $state.go(ctrl.source);
                })
                .error(errorHandling);
        }

    });

});
