angular.module('app.controllers').controller('purchasedListCtrl', function(
    $scope, orderService, loadDataMixin, stateUtils, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 跳转视频详情
        goVideoInfo: stateUtils.goVideoInfo,

        // 订单数据
        loadData: function () {
            ctrl.finishLoading = false;

            // 订单项结果集
            ctrl.items = [];

            var orderItems = [];

            // 获取订单项数据
            return orderService.getPurchasedList()
                .success(function(data) {

                    if (!data.list[0]) {
                        return;
                    } else {
                        orderItems = data.list[0];
                    }

                    _.forEach(orderItems, function(item) {
                        item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                    });

                    ctrl.items = orderItems;
                })
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

    // 订阅提交[支付订单成功]消息 刷新列表
    messageCenter.subscribeMessage(['pay.success', 'login'], function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});
