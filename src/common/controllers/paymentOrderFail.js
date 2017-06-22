angular.module('app.controllers').controller('paymentOrderFailCtrl', function(
    $scope, api, toast, $params, modals, $state, stateUtils
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 订单id
        orderId: $params.orderId,

        // 关闭弹窗
        close: function () {
            modals.paymentOrderFail.close();
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

        // 继续支付
        goPay: function(paymentName) {
            ctrl.close();

            // 去支付




            
        }

    });

});
