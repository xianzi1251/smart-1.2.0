angular.module('app.controllers').controller('userConsigneeListCtrl', function(
    $scope, consigneeService, loadDataMixin, errorHandling, messageCenter, modals, popup,
    toast
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 获取列表数据
        loadData: function () {
            ctrl.finishLoading = false;

            return consigneeService.getCosigneeList()
                .success(function(response) {
                    ctrl.list = response.list[0];
                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        },

        // 新增收货地址
        goAddConsignee: function() {
            modals.consigneeAdd.open();
        },

        // 删除收货地址
        deleteConsignee: function(consigneeId) {

            popup.confirm('提示', '确定要删除该收货信息吗？')
                .then(function(res) {
                    if(res) {
                        consigneeService.deleteCosigneeInfo(consigneeId)
                            .success(function() {
                                toast.open('删除收货信息成功');
                            })
                            .error(errorHandling);
                    }
                });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

    // 订阅提交[新增收货地址成功]消息 刷新列表
    messageCenter.subscribeMessage(['addCosignee.success', 'deleteConsignee.success'], function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});