angular.module('app.controllers').controller('paymentOrderSuccessCtrl', function(
    $scope, api, toast, $params, modals, stateUtils, $state, checkoutService, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 订单id
        orderId: $params.orderId,

        // 关闭弹窗
        close: function () {
            modals.paymentOrderSuccess.close();
        },

        // 查看我的订单
        goOrderInfo: function () {
            ctrl.close();

            setTimeout(function() {
                var stateName = stateUtils.getStateNameByCurrentTab('orderInfo');
                $state.go(stateName, {
                    orderId: ctrl.orderId
                });
            }, 200);

        },

        // 继续购物
        goShopping: function () {
            ctrl.close();
        },

        // 支付成功后，访问接口
        init: function() {
            checkoutService.payOrderSuccessCallback(ctrl.orderId)
                .success(function() {})
                .error(errorHandling);
        }

    });

    ctrl.init();

});
