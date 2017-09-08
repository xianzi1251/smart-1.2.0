angular.module('app.controllers').controller('consigneeEditCtrl', function(
    $scope, $params, errorHandling, consigneeService, validator, toast, loading, modals, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 编辑前的收货人信息
        consignee: $params.consignee,

        // 按钮文本：结算时‘保存并使用’，会员中心时‘保存’
        btnText: $params.btnText,

        // 初始化，获取收货人信息
        init: function() {

            consigneeService.getEditRegin(ctrl.consignee.districtId)
                .success(function(response) {
                    ctrl.selectedRegion = response.list[0];
                })
                .error(errorHandling);
        },

        // 提交编辑收货地址
        submit: function() {

            // 校验手机号码
            if(!validator.isMobile(ctrl.consignee.mobile)) {
                toast.open('手机号码格式有误');
                return;
            }

            loading.open();

            var consigneeId = ctrl.consignee.id,
                firstName = ctrl.consignee.firstName,
                street = ctrl.consignee.street,
                mobile = ctrl.consignee.mobile,
                districtId = ctrl.districtId || ctrl.consignee.districtId;

            consigneeService.editCosigneeInfo(consigneeId, firstName, street, districtId, '', mobile)
                .success(function(data) {

                    // 结算页中保存收货地址后，直接就使用了
                    if ($params.source == 'checkout') {
                        $params.successCallback(data.list[0][0]);
                    } else {
                        toast.open('编辑收货地址成功');
                        messageCenter.publishMessage('addCosignee.success');
                    }

                    modals.consigneeEdit.close();
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

    ctrl.init();
});