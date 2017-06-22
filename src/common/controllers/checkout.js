angular.module('app.controllers').controller('checkoutCtrl', function(
    $scope, toast, $params, modals, checkoutService, errorHandling, loading, payService, messageCenter,
    consigneeService, localStorage, utils
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 需结算的商品
        ordItemIds: $params.ordItemIds,

        // 初始化数据
        init: function() {
            ctrl.finishLoading = false;

            // 当前是否开启兑换／积分／收货地址[1: 关闭, 0: 开启]
            ctrl.bytSwitch = localStorage.get('user').bytSwitch;

            loading.open();

            // 获取结算数据
            checkoutService.getItems(ctrl.ordItemIds)
                .success(function(response) {
                    ctrl.data = response;

                    // 绝对路径图片
                    _.forEach(ctrl.data.items, function(item) {
                        item.sku.picUrl = window.APP_CONFIG.serviceAPI + item.sku.picUrl;
                    });

                    // 获取收货人信息
                    consigneeService.getCosigneeList()
                        .success(function(response) {
                            if (response.list[0].length > 0) {
                                ctrl.consigneeInfo = response.list[0][0];
                            } else {
                                ctrl.consigneeInfo = null;
                            }
                        })
                        .error(errorHandling)
                        .finally(function() {
                            loading.close();
                            ctrl.finishLoading = true;
                        });
                });
        },

        // 提交订单
        submit: function(paymentName) {

            // 需要判断是否必须有收货地址
            if (!ctrl.bytSwitch) {
                if (!ctrl.consigneeInfo) {
                    toast.open('请填写收货地址');
                    return;
                }
            }

            loading.open();
            
            var consigneeId;
            if (ctrl.consigneeInfo) {
                consigneeId = ctrl.consigneeInfo.id;
            } else {
                consigneeId = '';
            }

            // 创建订单
            checkoutService.creatOrder(ctrl.ordItemIds, paymentName, consigneeId)
                .success(function(response) {

                    // 生成的订单id
                    var orderId = response.config.order.object.order.id;

                    // 关闭弹窗
                    ctrl.close();
                    
                    // 去支付
                    payService.pay(orderId, paymentName)
                        .success(function() {

                            // 开启支付成功页面
                            modals.paymentOrderSuccess.open({
                                params: {
                                    orderId: orderId
                                }
                            });

                            // 广播消息 支付完成
                            messageCenter.publishMessage('pay.success');

                        })
                        .error(errorHandling);

                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                });
        },

        // 关闭弹窗
        close: function() {
            modals.checkout.close();
        },

        /**
         * 处理收货人信息
         */
        goConsignee: function() {

            if (ctrl.consigneeInfo) {
                // 进入选择提货人信息视图
                modals.checkoutConsigneeList.open({
                    params: {
                        orderId: ctrl.data.id,
                        selectedConsignee: ctrl.consigneeInfo,
                        successCallback: utils.proxy(ctrl, 'setSelectedConsignee')
                    }
                });
            } else {
                // 进入添加提货人信息视图
                modals.consigneeAdd.open({
                    params: {
                        orderId: ctrl.data.id,
                        source: 'checkout',
                        successCallback: utils.proxy(ctrl, 'setSelectedConsignee')
                    }
                });
            }
        },

        /**
         * 设置已选择的提货人信息
         */
        setSelectedConsignee: function(consignee) {
            ctrl.consigneeInfo = consignee;
        }

    });

    ctrl.init();

});
