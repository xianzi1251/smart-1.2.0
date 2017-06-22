angular.module('app.controllers').controller('buyNowCtrl', function(
    $scope, api, toast, $params, modals, cartService, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 商品信息
        item: $params.item,

        // 关闭弹窗
        close: function() {
            modals.buyNow.close();
        },

        // 立即购买
        submit: function () {
            ctrl.close();

            // 加入购物车
            cartService.addToCart(ctrl.item.sku)
                .success(function(response) {
                    var orderItemId = response.object.orderItemId;

                    // 打开结算页
                    modals.checkout.open({
                        params: {
                            ordItemIds: orderItemId
                        }
                    });
                })
                .error(errorHandling);
        }

    });

});
