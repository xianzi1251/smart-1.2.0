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
            var payment;
            if (ctrl.info.paymentType == '支付宝') {
                payment = 'AliPay';
            } else if (ctrl.info.paymentType == '微信') {
                payment = 'WeChat';
            }
            modals.choosePayment.open({
                params: {
                    orderId: ctrl.orderId,
                    payment: payment,
                    source: 'order',
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
                    
                    // 订单信息
                    ctrl.info = response.list[0][0];

                    // 订单快递信息
                    ctrl.expressInfo = response.object;

                    // 订单中的商品信息
                    ctrl.items = response.list[1];
                    _.forEach(ctrl.items, function(item) {
                        item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                    });

                    // 订单收货人信息
                    ctrl.consignee = response.list[2][0];

                    // 订单发票信息
                    ctrl.invoice = response.list[3];
                    if (!_.isEmpty(ctrl.invoice)) {
                        ctrl.invoiceName = ['个人', '企业'];
                        ctrl.invName = ['纸质发票', '电子发票'];
                        ctrl.invoiceInfo = ctrl.invoice[0];
                    }

                    // 订单优惠券信息
                    ctrl.coupon = response.list[4];
                    if (_.isEmpty(ctrl.coupon)) {
                        ctrl.couponInfo = '未使用优惠券';
                    } else {
                        ctrl.couponInfo = ctrl.coupon[0].label;
                    }

                })
                .error(errorHandling);
        },

        // 复制物流单号
        copyExpressNumber: function() {
            var expressNumber = ctrl.expressInfo.logisticsNumber;

            if(window.cordova && window.cordova.plugins) {
                cordova.plugins.clipboard.copy(expressNumber, function() {
                    toast.open('复制成功');
                }, angular.noop);
            }
        },

        // 打开退换货说明
        shoRefundInfo: function() {
            modals.orderRefundInfo.open();
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
