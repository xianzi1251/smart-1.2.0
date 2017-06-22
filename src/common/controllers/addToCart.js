angular.module('app.controllers').controller('addToCartCtrl', function(
    $scope, api, toast, $params, modals
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 商品信息
        item: $params.item,

        // 关闭弹窗
        close: function () {
            modals.addToCart.close();
        },

        // 确定加入购物车
        submit: function () {
            ctrl.close();
        }

    });

});
