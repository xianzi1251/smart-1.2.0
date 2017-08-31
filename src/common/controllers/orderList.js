angular.module('app.controllers').controller('orderListCtrl', function(
    $scope, api, orderService, errorHandling, loading, stateUtils, 
    $state, nativeTransition, modals, loadDataMixin, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 订单数据
        loadData: function () {
            ctrl.finishLoading = false;

            // 订单结果集
            ctrl.orders = [];

            var orderList = [],
                orderItems = [];

            // 获取订单列表数据
            return orderService.getOrderList()
                .success(function(response) {

                    if (!response.list[0]) {
                        return;
                    } else {
                        orderList = response.list[0];
                    }

                    // 获取订单项数据
                    orderService.getOrderItems()
                        .success(function(data) {

                            if (!data.list[0]) {
                                return;
                            } else {
                                orderItems = data.list[0];
                            }

                            // 根据id匹配来获取该订单的订单项
                            if (orderList && orderItems) {

                                _.forEach(orderList, function(order) {
                                    var orderId = order.orderId;
                                    order.items = [];

                                    _.forEach(orderItems, function(item) {
                                        var orderItemId = item.orderId;

                                        if (orderId == orderItemId) {
                                            item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                                            order.items.push(item);
                                        }
                                        
                                    });
                                });

                                ctrl.orders = orderList;

                            }
                        })
                        .error(errorHandling)
                        .finally(function() {
                            ctrl.finishLoading = true;
                        });
                })
                .error(errorHandling);
        },

        // 点评
        goComment: function(item, $event) {
            $event.stopPropagation();
            var stateName = stateUtils.getStateNameByCurrentTab('comment');
            nativeTransition.forward();
            $state.go(stateName, {
                id: item.id,
                skuId: item.skuId,
                title: item.title,
                source: 'tabs.orderList'
            });
        },

        // 查看订单详情
        goOrderInfo: function(orderId) {
            var stateName = stateUtils.getStateNameByCurrentTab('orderInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                orderId: orderId
            });
        },

        // 打开选择支付弹出层
        pay: function(order) {
            modals.choosePayment.open({
                params: {
                    orderId: order.orderId,
                    payment: order.payName,
                    source: 'order',
                    payableAmount: order.totalAmount
                } 
            });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

    // 订阅提交[支付订单成功/评论商品成功/修改支付方式]消息 刷新列表
    messageCenter.subscribeMessage(['pay.success', 'order.cancel', 'order.comment', 'chooosepayment.success'], function() {
        // ctrl.refresh({showLoading: false, emptyData: false});
        ctrl.init();
    });

});
