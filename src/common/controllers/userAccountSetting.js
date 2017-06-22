angular.module('app.controllers').controller('userAccountSettingCtrl', function(
    $scope, api, modals, errorHandling, userService, nativeTransition, $state, $stateParams, 
    localStorage
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 昵称
        nickName: $stateParams.nickName || '',

        // 简介
        personInfo: $stateParams.personInfo || '',

        // 微信绑定的手机号
        mobile: $stateParams.mobile || '',

        // 是否为第三方登录
        isthird: localStorage.get('user').thirdPartylogin ? 1 : 0,

        // 提交
        submit: function() {

            userService.updateAccountSetting(ctrl.nickName, ctrl.personInfo, ctrl.mobile, ctrl.isthird)
                .success(function() {
                    nativeTransition.forward();
                    $state.go('tabs.user');
                })
                .error(errorHandling);
        }

    });

});
