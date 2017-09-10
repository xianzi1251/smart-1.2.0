angular.module('app.controllers').controller('loginCtrl', function(
    $scope, api, modals, userService, errorHandling, loading, messageCenter, localStorage
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 登录名称
        loginName: '',

        // 密码
        password: '',

        // 是否支持微信
        isSupportWechat: false,

        // 确定当前是否可分享
        init: function() {
            if (window.wechatPay) {
                window.wechatPay.checkAppInstalled(function(res) {
                    if (res === 'true') {
                        ctrl.isSupportWechat = true;
                    }
                }, function(error) {

                });
            }
        },

        // 微信登录
        wechatLogin: function() {
            loading.open();
            userService.wechatLogin()
                .success(function(res) {
                    if (!res) {
                        alert('code is null');
                        return;
                    }

                    userService.getUnionInfo(res)
                        .success(function() {
                            modals.login.close();
                        })
                        .error(errorHandling);
                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                });
        },

        // 提交
        submit: function() {
            loading.open();
            userService.login(ctrl.loginName, ctrl.password)
                .success(function() {
                    modals.login.close();
                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                });
        },

        // 忘记密码
        goForgetPwd: function() {
            modals.forgetPwd.open();
        },

        // 注册
        goRegister: function() {
            modals.register.open();
        },

        // 随便看看
        goLook: function() {
            modals.login.close();
        }

    });

    ctrl.init();

});
