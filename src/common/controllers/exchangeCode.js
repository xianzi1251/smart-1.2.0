angular.module('app.controllers').controller('exchangeCodeCtrl', function(
    $scope, $state, nativeTransition, exchangeService, errorHandling, toast
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 兑换码
        excode: '',

        // 兑换
        submit: function() {
            exchangeService.exchangeCode(ctrl.excode)
                .success(function() {
                    toast.open('兑换成功');
                    ctrl.excode = '';
                    ctrl.goExchangeCodeList();
                })
                .error(errorHandling);
        },

        // 兑换规则
        goExchangeRule: function() {
            nativeTransition.forward();
            $state.go('tabs.exchangeRule');
        },

        // 兑换记录列表
        goExchangeCodeList: function() {
            nativeTransition.forward();
            $state.go('tabs.exchangeRecordList');
        }

    });

});
