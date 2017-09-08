angular.module('app.controllers').controller('checkoutConsigneeListCtrl', function(
    $scope, consigneeService, loadDataMixin, errorHandling, messageCenter, modals,
    $params
) {

    var ctrl = this;

    $params = _.defaults({}, $params, {
        orderId: undefined,
        selectedConsignee: undefined,
        successCallback: _.noop
    });

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 获取列表数据
        loadData: function () {
            ctrl.finishLoading = false;

            return consigneeService.getCosigneeList()
                .success(function(response) {
                    ctrl.list = response.list[0];

                    _.forEach(ctrl.list, function(item) {
                        if (item.id == $params.selectedConsignee.id) {
                            item.selected = true;
                        } else {
                            item.selected = false;
                        }
                    });

                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        },

        // 所选地址对象
        selected: function(consignee, $event) {

            if ($event) {
                $event.stopPropagation();
            }

            _.forEach(ctrl.list, function(item) {
                if (item.id == consignee.id) {
                    item.selected = true;
                    ctrl.selectedConsignee = item;
                } else {
                    item.selected = false;
                }
            });

            ctrl.confirmselected();
        },

        // 确定所选收货人信息
        confirmselected: function() {
            $params.successCallback(ctrl.selectedConsignee);
            $scope.modals.checkoutConsigneeList.close();
        },

        // 新增收货地址
        goAddConsignee: function() {
            modals.consigneeAdd.open({
                params: {
                    btnText: '保存并使用',
                    source: 'checkout',
                    successCallback: function(response) {
                        ctrl.selectedConsignee = response;
                        ctrl.confirmselected();
                    }
                }
            });
        },

        // 编辑收货地址
        modifyConsignee: function(consignee, $event) {

            $event.stopPropagation();

            modals.consigneeEdit.open({
                params: {
                    consignee: consignee,
                    btnText: '保存并使用',
                    source: 'checkout',
                    successCallback: function(response) {
                        ctrl.selectedConsignee = response;
                        ctrl.confirmselected();
                    }
                }
            });
        }

    });

    // 加载数据
    ctrl.init();

    // 订阅提交[新增收货地址成功]消息 刷新列表
    messageCenter.subscribeMessage(['addCosignee.success'], function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});