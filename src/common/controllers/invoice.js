/**
 * 结算中心--发票
 */
angular.module('app.controllers').controller('invoiceCtrl', function(
    $scope, $state, $params, modals, toast, validator
) {
    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        data: angular.extend({
            // 是否需要发票（0-否／1-是）
            needInvoice: 0,

            // 发票类型（1-纸质发票／2-电子发票）
            invType: 1,

            // 发票抬头类型（1-个人／2-单位）
            invoiceType: 1,

            // 发票抬头
            invoiceTitle: '',

            // 发票税号
            taxpayerNo: '',

            // 发票发送邮箱
            invoiceEmail: ''
        }, $params.data.invoice),

        // 选择是否开发票
        chooseNeedInvoice: function(value) {
            ctrl.data.needInvoice = value;

            // 切换时置空所有的input框
            ctrl.data.invoiceTitle = '';
            ctrl.data.taxpayerNo = '';
            ctrl.data.invoiceEmail = '';
        },

        // 选择发票类型
        chooseInvType: function(value) {
            ctrl.data.invType = value;
        },
        
        // 选择发票抬头类型
        chooseTnvoiceType: function(value) {
            ctrl.data.invoiceType = value;

            // 切换时置空所有的input框
            ctrl.data.invoiceTitle = '';
            ctrl.data.taxpayerNo = '';
            ctrl.data.invoiceEmail = '';
        },

        // 提交发票
        submit: function() {
            var data = ctrl.data;

            data.invoiceTitle = _.trim(data.invoiceTitle);
            data.taxpayerNo = _.trim(data.taxpayerNo);
            data.invoiceEmail = _.trim(data.invoiceEmail);

            // 数据校验
            if (data.needInvoice === 1) {

                if (data.invoiceType === 1) {

                    if (!data.invoiceTitle) {
                        toast.open('请填写个人名称');
                        return;
                    }
                } else if (data.invoiceType === 2) {

                    if (!data.invoiceTitle) {
                        toast.open('请填写单位名称');
                        return;
                    } else if (!data.taxpayerNo) {
                        toast.open('请填写单位税号');
                        return;
                    }
                }

                if (data.invType === 2) {

                    if (!data.invoiceEmail) {
                        toast.open('请填写您的邮箱');
                        return;
                    } else if (!validator.isEmail(data.invoiceEmail)) {
                        toast.open('请填写正确的邮箱格式');
                        return;
                    }
                }
            }

            // 提交数据
            $params.callback(data);
            $scope.modals.invoice.close();
        }
        
    });
});
