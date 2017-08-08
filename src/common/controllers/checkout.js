angular.module('app.controllers').controller('checkoutCtrl', function(
    $scope, toast, $params, modals, checkoutService, errorHandling, loading, payService, messageCenter,
    consigneeService, utils
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 需结算的商品
        ordItemIds: $params.ordItemIds,

        // 需提交的内容
        checkoutInfo: {
            // 发票信息-默认不开发票
            invoice: {
                needInvoice: 0
            },
            payment: 'AliPay'
        },

        // 默认的发票
        invoiceInfo: '不开具发票',

        // 默认的优惠券
        couponInfo: '无优惠券信息',

        // 初始化数据
        init: function() {

            consigneeService.getCosigneeList()
                .success(function(response) {
                    if (response.list[0].length > 0) {
                        ctrl.consigneeInfo = response.list[0][0];

                        ctrl.updateConsigneeInfo();

                    } else {
                        ctrl.consigneeInfo = null;
                    }
                })
                .error(errorHandling);
        },

        // 修改收货地址，重新计算运费且重新获取结算信息
        updateConsigneeInfo: function() {
            loading.open();

            ctrl.finishLoading = false;

            consigneeService.getFreight(ctrl.consigneeInfo.id, ctrl.consigneeInfo.districtId)
                .success(function() {
                    ctrl.getCheckoutInfo();
                })
                .error(errorHandling);
        },

        // 获取结算信息
        getCheckoutInfo: function() {

            checkoutService.getItems(ctrl.ordItemIds)
                .success(function(response) {
                    ctrl.data = response;

                    // 绝对路径图片
                    _.forEach(ctrl.data.items, function(item) {
                        item.sku.picUrl = window.APP_CONFIG.serviceAPI + item.sku.picUrl;
                    });

                    loading.close();

                    ctrl.finishLoading = true;

                });
        },

        // 提交订单
        submit: function() {

            var ordItemIds = ctrl.ordItemIds,
                payment = ctrl.checkoutInfo.payment;

            // 需要判断是否必须有收货地址
            if (!ctrl.consigneeInfo) {
                toast.open('请填写收货地址');
                return;
            }

            loading.open();

            // 创建订单
            checkoutService.creatOrder(ordItemIds, payment)
                .success(function(response) {

                    // 生成的订单id
                    var orderId = response.config.order.object.order.id;

                    // 关闭弹窗
                    ctrl.close();
                    
                    // 去支付
                    payService.pay(orderId, payment)
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

            ctrl.updateConsigneeInfo();
        },

        /**
         * 进入编辑发票信息视图
         */
        goInvoice: function() {
            modals.invoice.open({
                params: {
                    data: {
                        invoice: ctrl.checkoutInfo.invoice
                    },
                    callback: function(invoice) {
                        ctrl.checkoutInfo.invoice = invoice;
                        if (invoice.needInvoice === 0) {
                            ctrl.invoiceInfo = '不开具发票';
                        } else {

                            var invType = ['纸质', '电子'];
                            var invoiceType = ['个人', '单位'];

                            ctrl.invoiceInfo = '明细(' + invType[invoice.invType - 1] + ')-(' + invoiceType[invoice.invoiceType - 1] + ')';
                        }
                    }
                }
            });
        },

        /**
         * 选择支付方式
         */
        goChoosePayment: function() {
            modals.choosePayment.open({
                params: {
                    orderId: ctrl.data.id,
                    source: 'checkout',
                    payment: ctrl.checkoutInfo.payment,
                    callback: function(payment) {
                        ctrl.checkoutInfo.payment = payment;
                    }
                }
            });
        },

        /**
         * 查看金额信息
         */
        goCheckoutAmount: function() {
            modals.checkoutAmount.open();
        },

        /**
         * 选择优惠券
         */
        goCheckoutCoupon: function() {
            modals.checkoutCoupon.open({
                params: {
                    ordItemIds: ctrl.ordItemIds,
                    callback: function(couponInfo, data) {
                        ctrl.couponInfo = couponInfo;
                        if (data) {
                            ctrl.data = data;
                        }
                    }
                }
            });
        }
    });

    ctrl.init();

});
