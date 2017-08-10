angular.module('app.controllers').controller('couponListCtrl', function(
    $scope, $state, errorHandling, loadDataMixin, couponService, loading
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 当前可显示的优惠券列表（0-未使用／1-已使用／2-已过期）
        type: 0,

        // tab显示的文本
        tabText: ['未使用', '已使用', '已过期'],

        // 切换tab
        onSwitchType: function(type) {
            if (ctrl.type !== type) {
                ctrl.type = type;
                ctrl.refresh();
            }
        },

        // 获取列表数据
        loadData: function () {

            loading.open();
            ctrl.finishLoading = false;

            return couponService.list(ctrl.type)
                .success(function(response) {
                    ctrl.coupons = response.list[0];
                    ctrl.total = response.object;
                    loading.close();
                    ctrl.finishLoading = true;
                })
                .error(errorHandling);
        }
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
