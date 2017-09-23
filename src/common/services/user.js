/**
 * 封装用户相关业务操作
 */
angular.module('app.services').factory('userService',function(
    $http, api, messageCenter, localStorage, errorHandling
){

    return {
        /**
         * 获取用户信息
         */
        info: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_ACC_ACCOUNT_GET', {
                    proName: 'BYT_ACC_ACCOUNT_GET',
                    userId: window.APP_USER.id
                })
                .success(function(data) {
                    messageCenter.publishMessage('user.info', data);
                });
        },

        /**
         * 账号设置
         */
        updateAccountSetting: function(nickName, personInfo, mobile, isthird) {
            return api.post('/cosmos.json?command=scommerce.BYT_ACC_ACCOUNT_SETTING', {
                    proName: 'BYT_ACC_ACCOUNT_SETTING',
                    nickName: nickName,
                    personInfo: personInfo,
                    mobile: mobile,
                    isthird: isthird,
                    userId: window.APP_USER.id
                });
        },

        /**
         * 注册页面：未注册过的手机号可以发送短信验证码
         */
        verifyUniqueUser: function(userName) {
            return api.post('/cosmos.json?command=scommerce.BYT_USER_EXISTS_ACTION', {
                proName: 'BYT_USER_EXISTS_ACTION',
                userName: userName
            });
        },

        /**
         * 找回密码页面：注册过的手机号可以发送短信验证码
         */
        verifyExistUser: function(userName) {
            return api.post('/cosmos.json?command=scommerce.BYT_FINDUSER_EXISTS_ACTION', {
                proName: 'BYT_FINDUSER_EXISTS_ACTION',
                userName: userName
            });
        },

        /**
         * 检查用户是否登录
         */
        hasLogined: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_CHECK_ISLOGIN', {
                proName: 'BYT_CHECK_ISLOGIN',
                userId: window.APP_USER.id
            })
            .success(function(response) {
                var bytSwitch = response.object.bytSwitch;
                var bytSwitch21 = response.object.bytSwitch21;

                var user = {
                    bytSwitch: bytSwitch,
                    bytSwitch21: bytSwitch21
                };

                _.assign(APP_USER, user);

                localStorage.set('user', APP_USER);
            });
        },

        /**
         * 登录操作
         */
        login: function(userName, password) {
            var credentials = 'userName=' + userName + '|password=' + password;

            return api.post('/cosmos.json?command=scommerce.BYT_SYS_LOGIN', {
                    proName: 'BYT_SYS_LOGIN',
                    userName: userName,
                    credentials: credentials
                })
                .success(function(data) {
                    messageCenter.publishMessage('login', data);
                });
        },

        /**
         * 微信登录
         */
        wechatLogin: function() {
            var deferred = api.defer();

            window.wechatPay.login(function(res) {
                deferred.resolve({data:res});
            }, function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },

        /**
         * 根据微信登录返回的code值来获取用户的基本信息
         */
        getUnionInfo: function(code) {
            return api.get('/WechatLoginServlet.slrt', {
                proName: 'WECHAT_LOGIN',
                code: code
            })
            .success(function(data) {
                messageCenter.publishMessage('wechatLogin', data);
            });
        },

        /**
         * 登出操作
         */
        logout: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_SYS_LOGOUT', {
                proName: 'BYT_SYS_LOGOUT'
            })
            .finally(function() {
                messageCenter.publishMessage('logout');
            });
        },

        /**
         * 注册
         * - userName         帐号登录名称，必须为手机号码
         * - password         密码
         * - smsVerifyCode    短信验证码
         * - validateEvent    短信验证码类型
         */
        register: function(userName, smsVerifyCode, password, validateEvent) {
            return api.post('/cosmos.json?command=scommerce.BYT_ACC_ACCOUNT_REGISTER_ACTION', {
                proName: 'BYT_ACC_ACCOUNT_REGISTER_ACTION',
                userName: userName,
                userPassword: password,
                userType: 'ecommerce',
                validateCode: smsVerifyCode,
                validateEvent: validateEvent,
                validateType: 'mobile'
            })
                .success(function(data) {
                    messageCenter.publishMessage('register', data);
                    messageCenter.publishMessage('login', data);
                });
        },

        /**
         * 修改密码
         * - oldPassdword     旧密码
         * - newPassword      新密码
         * - smsVerifyCode    短信验证码
         * - validateEvent    短信验证码类型
         */
        modifyPassword: function(userName, oldPassdword, newPassword, smsVerifyCode, validateEvent) {
            return api.post('/cosmos.json?command=scommerce.BYT_ACCOUNT_MODIFYPASSWORD_ACTION', {
                proName: 'BYT_ACCOUNT_MODIFYPASSWORD_ACTION',
                userId: window.APP_USER.id,
                userName: userName,
                oldPassdword: oldPassdword,
                newPassword: newPassword,
                validateCode: smsVerifyCode,
                validateEvent: validateEvent,
                validateType: 'mobile'
            });
        },

        /**
         * 绑定手机号
         * - userName         需要绑定的手机号
         * - password         新密码
         * - smsVerifyCode    短信验证码
         */
        wechatBindMobile: function(mobile, password, smsVerifyCode) {
            return api.post('/cosmos.json?command=scommerce.BYT_ACCOUNT_BINDPHONE_ACTION', {
                proName: 'BYT_ACCOUNT_BINDPHONE_ACTION',
                userId: window.APP_USER.id,
                userName: mobile,
                newPassword: password,
                validateCode: smsVerifyCode,
                validateEvent: 'bindPhone',
                validateType: 'mobile'
            });
        },

        /**
         * 找回密码
         * - userName         帐号登录名称，必须为手机号码
         * - userPassword     密码
         * - smsVerifyCode    短信验证码
         * - validateEvent    短信验证码类型
         */
         forgetPwd: function(userName, userPassword, smsVerifyCode, validateEvent) {
             return api.post('/cosmos.json?command=scommerce.BYT_ACCOUNT_FINDPASSWORD_ACTION', {
                proName: 'BYT_ACCOUNT_FINDPASSWORD_ACTION',
                userName: userName,
                userPassword: userPassword,
                validateCode: smsVerifyCode,
                validateEvent: validateEvent,
                validateType: 'mobile'
             });
         },

        /**
         * 发送手机短信验证码
         */
        sendSMSVerifyCode: function(obj) {
            var kaptcha = obj.imageVerifyCode,
                mobile = obj.phoneNumber,
                content = obj.content,
                validateEvent = obj.event;

            return api.post('/cosmos.json?command=config.comSender', {
                proName: 'comSender',
                mobile: mobile,
                Content: content,
                validateEvent: validateEvent,
                validateType: 'mobile',
                kaptcha: kaptcha
            });
        },

        /**
         * 验证码短信验证码是否跟手机号码匹配
         */
        validateSMSVerifyCode: function(phoneNumber, smsVerifyCode) {
            return api.post('/global/validateSMSVerifyCode', {
                phoneNumber: phoneNumber,
                smsVerifyCode: smsVerifyCode
            });
        },

        /**
         * 意见反馈
         * - contactInformation  联系方式
         * - content             意见反馈
         */
        submitFeedback: function(contactInformation, content) {
            return api.post('/cosmos.json?command=scommerce.BYT_CMT_COMMENT_PUBLISH', {
                proName: 'BYT_CMT_COMMENT_PUBLISH',
                contactInformation: contactInformation,
                content: content,
                commentType: 'buyconsult'
            });
        }

        // /**
        //  * [setAvatar 设置默认头像]
        //  */
        // setAvatar: function (defaultAvatarId) {
        //     return api.post('/member/setDefaultAvatar', {
        //         defaultAvatarId: defaultAvatarId
        //     });
        // },

        // uploadAvatar: function(pic) {
        //     if (/^data:image\/jpeg;base64,/.test(pic)) {
        //         pic = pic.split('data:image/jpeg;base64,')[1];
        //     }
        //     return api.post('/member/uploadAvatar', {
        //         pic: pic
        //     });
        // }

    };
});
