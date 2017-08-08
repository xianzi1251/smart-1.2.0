angular.module('app.controllers').controller('checkoutCouponCtrl', function(
    $scope, $state, $params, errorHandling, loadDataMixin, couponService, loading, modals, toast
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

            // 选中的优惠券
            ctrl.selectedCouponList = [];

            loading.open();
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
                                    coupon.selected = false;
                                });
                            })
                            .error(errorHandling)
                            .finally(function() {
                                loading.close();
                                ctrl.finishLoading = true;
                            });
                    } else {
                        loading.close();
                        ctrl.finishLoading = true;
                    }
                })
                .error(errorHandling);
        },

        // 切换优惠券选择状态
        toggleSelect: function(coupon) {
            coupon.selected = !coupon.selected;
            ctrl.selectedCouponList = [];
            
            // 筛选出已选中的优惠券
            _.forEach(ctrl.availableCouponList, function(coupon) {
                if (coupon.selected) {
                    ctrl.selectedCouponList.push(coupon);
                }
            });
        },

        // 确定使用优惠券：不允许使用多张优惠券
        confirm: function() {

            var selectedCoupon = ctrl.selectedCouponList;

            if (selectedCoupon.length === 0) {

                $params.callback('无优惠券信息', {});
                ctrl.close();

            } else if (selectedCoupon.length > 1) {

                toast.open('不可同时使用多张优惠券');
                return;

            } else {

                couponService.chooseCoupon(ctrl.ordItemIds, selectedCoupon[0].code)
                    .success(function(response) {
                        $params.callback(selectedCoupon[0].label, response);
                        ctrl.close();
                    })
                    .error(errorHandling);
    
            }
        },

        // 关闭弹窗
        close: function() {
            modals.checkoutCoupon.close();
        }
    });

    ctrl.init();

});
