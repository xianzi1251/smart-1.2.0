angular.module('app.controllers').controller('checkoutCouponCtrl', function(
    $scope, $state, $params, errorHandling, loadDataMixin, couponService, loading, modals, toast, checkoutService
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 需结算的商品
        ordItemIds: $params.ordItemIds,

        // 当前可显示的优惠券列表（1-可用优惠券／0-不可用优惠券）
        type: 1,

        // tab显示的文本
        tabText: ['可使用优惠券', '不可使用优惠券'],

        // 选中的优惠券
        selectedCouponList: [],

        // 默认选中的优惠券code
        defaultCouponCode: $params.couponCode,

        // 切换可用／不可用优惠券
        onSwitchType: function(type) {
            if (ctrl.type !== type) {
                ctrl.type = type;
            }
        },

        // 获取列表数据
        loadData: function () {

            // 可用优惠券列表
            ctrl.availableCouponList = [];

            // 不可用优惠券列表
            ctrl.unAvailableCouponList = [];

            ctrl.finishLoading = false;

            return couponService.getAllCouponList()
                .success(function(response) {
                    var allCoupons = response.list[0];
                    var allCouponCodes = [];
                    var codes = '';

                    if (allCoupons.length > 0) {

                        _.forEach(allCoupons, function(coupon) {
                            codes += coupon.code + ',';
                            allCouponCodes.push(coupon.code);
                        });

                        allCouponCodes = _.uniq(allCouponCodes);

                        couponService.getCheckoutCouponList(ctrl.ordItemIds, codes)
                            .success(function(list) {
                                var checkoutCoupons = list.coupons;
                                var checkoutCouponCodes = [],
                                    unCheckoutCouponCodes = [];

                                _.forEach(checkoutCoupons, function(checkoutCoupon) {
                                    checkoutCouponCodes.push(checkoutCoupon.code);
                                });

                                checkoutCouponCodes = _.uniq(checkoutCouponCodes);

                                unCheckoutCouponCodes = _.difference(allCouponCodes, checkoutCouponCodes);

                                _.forEach(allCoupons, function(allCoupon) {
                                    
                                    _.forEach(checkoutCouponCodes, function(code) {
                                        if (allCoupon.code === code) {
                                            ctrl.availableCouponList.push(allCoupon);
                                        }
                                    });

                                    _.forEach(unCheckoutCouponCodes, function(code) {
                                        if (allCoupon.code === code) {
                                            ctrl.unAvailableCouponList.push(allCoupon);
                                        }
                                    });
                                });

                                // 默认未选择优惠券
                                _.forEach(ctrl.availableCouponList, function(coupon) {

                                    if (coupon.code === ctrl.defaultCouponCode) {
                                        coupon.selected = true;
                                    } else {
                                        coupon.selected = false;
                                    }
                                });
                            })
                            .error(errorHandling)
                            .finally(function() {
                                ctrl.finishLoading = true;
                            });
                    } else {
                        ctrl.finishLoading = true;
                    }
                })
                .error(errorHandling);
        },

        // 切换优惠券选择状态
        toggleSelect: function(coupon) {
            coupon.selected = !coupon.selected;
        },

        // 确定使用优惠券：不允许使用多张优惠券
        confirm: function() {

            ctrl.selectedCouponList = [];
            
            // 筛选出已选中的优惠券
            _.forEach(ctrl.availableCouponList, function(coupon) {
                if (coupon.selected) {
                    ctrl.selectedCouponList.push(coupon);
                }
            });

            var selectedCoupon = ctrl.selectedCouponList;

            if (selectedCoupon.length === 0) {

                loading.open();

                checkoutService.getItems(ctrl.ordItemIds)
                    .success(function(response) {

                        // 绝对路径图片
                        _.forEach(response.items, function(item) {
                            item.sku.picUrl = window.APP_CONFIG.serviceAPI + item.sku.picUrl;
                        });

                        $params.callback('无优惠券信息', 0, '', response);
                        ctrl.close();
                    })
                    .error(errorHandling)
                    .finally(function() {
                        loading.close();
                    });

            } else if (selectedCoupon.length > 1) {

                toast.open('不可同时使用多张优惠券');
                return;

            } else {

                loading.open();

                // 如果当前选中的code与之前选中的一致，则不需要访问接口，可直接关闭弹窗
                if (selectedCoupon[0].code === ctrl.defaultCouponCode) {

                    checkoutService.getItems(ctrl.ordItemIds)
                        .success(function(response) {

                            // 绝对路径图片
                            _.forEach(response.items, function(item) {
                                item.sku.picUrl = window.APP_CONFIG.serviceAPI + item.sku.picUrl;
                            });

                            $params.callback(selectedCoupon[0].label, selectedCoupon[0].parValue, selectedCoupon[0].code, response);
                            ctrl.close();
                        })
                        .error(errorHandling)
                        .finally(function() {
                            loading.close();
                        });

                } else {

                    couponService.chooseCoupon(ctrl.ordItemIds, selectedCoupon[0].code)
                        .success(function(response) {
                            $params.callback(selectedCoupon[0].label, selectedCoupon[0].parValue, selectedCoupon[0].code, response);
                            ctrl.close();
                        })
                        .error(errorHandling)
                        .finally(function() {
                            loading.close();
                        });
                }
            }
        },

        // 关闭弹窗
        close: function() {
            modals.checkoutCoupon.close();
        }
    });

    ctrl.init();

});
