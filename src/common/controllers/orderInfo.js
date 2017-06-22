angular.module('app.controllers').controller('orderInfoCtrl', function(
    $scope, $stateParams, orderService, errorHandling, stateUtils, modals, toast,
    messageCenter, loadDataMixin, popup, localStorage
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        orderId: $stateParams.orderId,

        // 跳转商品详情
        goProductInfo: stateUtils.goProductInfo,

        // 打开选择支付弹出层
        pay: function() {
            modals.choosePayment.open({
                params: {
                    orderId: ctrl.orderId
                } 
            });
        },

        // 取消订单
        cancle: function() {

            popup.confirm('提示', '确定要取消该订单吗？')
                .then(function(res) {
                    if(res) {
                        orderService.cancleOrder(ctrl.orderId)
                            .success(function() {
                                toast.open('取消订单成功');
                            })
                            .error(errorHandling);
                    }
                });
        },

        // 获取订单信息
        loadData: function() {

            return orderService.getOrderInfo(ctrl.orderId)
                .success(function(response) {

                    // 当前是否开启兑换／积分／收货地址[1: 关闭, 0: 开启]
                    ctrl.bytSwitch = localStorage.get('user').bytSwitch;
                    
                    ctrl.info = response.list[0][0];
                    ctrl.items = response.list[1];
                    ctrl.consignee = response.list[2][0];

                    // 订单商品图片
                    _.forEach(ctrl.items, function(item) {
                        item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                    });

                })
                .error(errorHandling);
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

    // 订阅提交[支付订单成功/取消订单]消息 刷新列表
    messageCenter.subscribeMessage(['pay.success', 'order.cancel', 'chooosepayment.success'], function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});
