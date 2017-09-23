angular.module('app.controllers').controller('forgetPwdCtrl', function(
    $scope, api, modals, toast, validator, userService, messageCenter, $state, $interval, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 短信发送状态
        sendStatus: 0,

        // 锁定按钮
        lockSend: false,

        // 获取验证码文本  点击后 重置为 重新获取
        sendVerifyCodeText: '获取验证码',

        // 发送验证码倒计时
        timeDown: undefined,

        // 定时器ID
        interval: 0,

        // 手机号
        loginName: '',

        // 验证码
        smsVerifyCode: '',

        // 密码
        password: '',

        /**
         * 发送短信验证码
         */
        sendSMSVerifyCode: function() {

            // 发送验证码之前先验证用户名是否合法
            var phoneNumber = ctrl.loginName;

            if (!phoneNumber) {
                toast.open('请输入手机号');
                return;
            }

            // 检测手机号码是否合法
            if (!validator.isMobile(phoneNumber)) {
                toast.open('请输入有效的手机号码');
                return;
            }

            if (!ctrl.imageVerifyCode) {
                toast.open('请输入图片验证码');
                return;
            }

            // 注册过的手机号可以发送短信验证码
            userService.verifyExistUser(phoneNumber)
                .success(function(response) {

                    // 上次和本次手机号不一样 且有倒计时则取消计时器
                    if (ctrl.backMobile != ctrl.loginName && ctrl.interval != 0) {
                        // 重置
                        resetSendSMS();
                    }

                    // 发送状态
                    ctrl.sendStatus = 0;

                    // 防止重复发送
                    if (ctrl.lockSend) {
                        toast.open('获取验证码');
                        return;
                    }

                    // 锁定发送
                    ctrl.lockSend = true;

                    // 记录手机号
                    if (ctrl.backMobile != ctrl.loginName) {
                        ctrl.backMobile = ctrl.loginName;
                    }

                    // 保存验证码参数
                    var saveSMSParam = {
                        phoneNumber: ctrl.loginName,
                        event: 'forgetLoginPwd',
                        userId: ctrl.loginName
                    };

                    // 发送验证码参数
                    var sendSMSParam = {
                        imageVerifyCode: ctrl.imageVerifyCode,
                        phoneNumber: ctrl.loginName,
                        content: "尊敬的用户，您在进行半月谈时政教育找回密码，验证码：<vcode>，请妥善保管。",
                        event: 'forgetLoginPwd'
                    }

                    // 发送验证码
                    userService.sendSMSVerifyCode(sendSMSParam)
                        .success(function(data) {

                            ctrl.sendVerifyCodeText = '重新获取';
                            // 发送状态
                            ctrl.sendStatus = 1;

                            // 初始倒计时60秒
                            ctrl.timeDown = 60;

                            // 重新获取验证码倒计时
                            checkSendTime();
                        })
                        .error(errorHandling)
                        .finally(function() {
                            // 解锁
                            ctrl.lockSend = false;

                            // 重新获取图片校验码
                            ctrl.getImageVerifyCodeUrl();
                        });
                })
                .error(errorHandling);
        },

        // 获取图片校验码
        getImageVerifyCodeUrl: function() {
            var url = window.APP_CONFIG.serviceAPI + '/cosmos.json?command=scommerce.captcha&timestamp=' + new Date().getTime();
            ctrl.imageVerifyCodeUrl = url;
        },

        // 提交
        submit: function() {
        	if (ctrl.password != ctrl.rePassword) {
                toast.open('新密码和确认密码不一致');
                return;
            }

            userService.forgetPwd(ctrl.loginName, ctrl.password, ctrl.smsVerifyCode, 'forgetLoginPwd')
                .success(function() {
                    modals.forgetPwd.close();
                })
                .error(errorHandling);
        }

    });

	// 重置发送短信状态
    function resetSendSMS() {

        // 取消计时器
        $interval.cancel(ctrl.interval);

        // 重置按钮文本
        ctrl.sendVerifyCodeText = '获取验证码';

        // 重置倒计时
        ctrl.timeDown = undefined;

        // 重置发送状态
        ctrl.sendStatus = 0;

        // 解除锁定
        ctrl.lockSend = false;

    }

    /**
     * 重新获取倒计时,倒计时结束解锁按钮
     */
    function checkSendTime() {
        // 开启定时器
        ctrl.interval = $interval(function() {
            // 判断剩余时间
            if (ctrl.timeDown > 0) {
                ctrl.timeDown--;
            } else {
                // 取消定时器
                $interval.cancel(ctrl.interval);
                // 倒计时结束解锁重新获取按钮 隐藏倒计时
                ctrl.timeDown = undefined;
            }
        }, 1000);

    }

    // 获取图片校验码
    ctrl.getImageVerifyCodeUrl();

});
