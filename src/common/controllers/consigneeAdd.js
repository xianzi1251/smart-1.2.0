angular.module('app.controllers').controller('consigneeAddCtrl', function(
    $scope, loadDataMixin, errorHandling, consigneeService, validator, toast, loading, modals,
    $params, messageCenter
) {

    var ctrl = this;

    $params = _.defaults({}, $params, {
        orderId: undefined,
        source: undefined,
        successCallback: _.noop
    });

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 按钮文本：结算时‘保存并使用’，会员中心时‘保存’
        btnText: $params.btnText,

        // 提交新增收货地址
        submit: function() {

            // 校验手机号码
            if(!validator.isMobile(ctrl.mobile)) {
                toast.open('手机号码格式有误');
                return;
            }

            loading.open();

            consigneeService.addCosigneeInfo(ctrl.firstName, ctrl.street, ctrl.districtId, '', ctrl.mobile)
                .success(function(data) {

                    // 结算页中保存收货地址后，直接就使用了
                    if ($params.source == 'checkout') {
                        $params.successCallback(data.list[0][0]);
                    } else {
                        toast.open('新增收货地址成功');
                        messageCenter.publishMessage('addCosignee.success');
                    }

                    modals.consigneeAdd.close();
                })
                .error(errorHandling)
                .finally(function() { 
                    loading.close(); 
                });
        },

        // 修改地区id
        changeRegion: function() {
            ctrl.districtId = _.get(_.last(this.selectedRegion), 'id');
        }

    });
});