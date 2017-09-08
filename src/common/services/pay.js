/**
 * 支付相关接口
 */
angular.module('app.services').factory('payService', function(
    api, $ionicPlatform, toast, loading, errorHandling, messageCenter
) {
    /**
     * 定义所有支持的支付操作
     */
    var paymentMethods = {
            /**
             * 微信支付 sdk
             */
            WeChat: function(payInfo) {
                var apiDeferred = api.defer();

                window.wechatPay.checkAppInstalled(function(isInstallWechatApp) {
                    if (isInstallWechatApp === 'true') {
                        window.wechatPay.pay(
                            payInfo,

                            function sucess() {
                                apiDeferred.resolve();
                            },

                            function error(message) {
                                apiDeferred.reject(APP_STATE_CODE.unknownException, message);
                            }
                        );
                    } else {
                        apiDeferred.reject(APP_STATE_CODE.notInstalledWechat, '您还没有安装微信客户端~');
                    }
                });

                return apiDeferred.promise;
            },

            /**
             * 支付宝支付 sdk
             */
            AliPay: function(payInfo) {
                var apiDeferred = api.defer();

                window.alipay.check(function(isInstalled) {
                    if (isInstalled === 'true') {
                        window.alipay.pay(
                            payInfo.data.info,

                            function sucess() {
                                apiDeferred.resolve();
                            },

                            function error(code) {

                                // 支付宝错误码映射
                                var errorMsgs = {
                                    '4000': '订单支付失败',
                                    '6001': '您已取消支付',
                                    '6002': '网络连接出错'
                                };
                                var message = errorMsgs[code];
                                if (!message) {
                                    message = '未知异常';
                                }
                                apiDeferred.reject(APP_STATE_CODE.unknownException, message);
                            }
                        );
                    } else {
                        apiDeferred.reject(APP_STATE_CODE.unknownException, '您还没有安装支付宝客户端~');
                    }
                });

                return apiDeferred.promise;
            }
        },

        payService = {

            /**
             * 进行wap 支付宝 支付操作
             */
            getAliWapPayURL: function(orderId, paymodeId) {
                return APP_CONFIG.service + '/pay/wapPay?orderId=' + orderId + '&paymentModeId=' + paymodeId;
            },

            /**
             * 进行微信 js-api 支付操作
             */
            wechatPay: function(orderId, orderNo, price, paymodeId) {

                loading.open();
                var params = {
                        orderId: _.trim(orderId),
                        paymentModeId: paymodeId,
                        openId: APP_USER.openId
                    },

                    //请求支付数据
                    promise = api.post('/pay/topay', params)
                    .then(function(response) {

                        var data = response.data.info;
                        var apiDeferred = api.defer();

                        data = $.parseJSON(data);

                        //调起微信支付
                        wx.chooseWXPay({
                            timestamp: data.timeStamp,
                            nonceStr: data.nonceStr,
                            package: data.package,
                            signType: data.signType,
                            paySign: data.sign,

                            success: function(res) {
                                apiDeferred.resolve();
                            },

                            fail: function(res) {
                                apiDeferred.reject(APP_STATE_CODE.payFailed);
                            },

                            cancel: function(res) {
                                apiDeferred.reject(APP_STATE_CODE.payCanceled);
                            }
                        });

                        return apiDeferred.promise;
                    })
                    .finally(function() {
                        loading.close();
                    });

                return promise;
            },

            /**
             * 进行支付操作
             */
            pay: function(orderId, paymentName) {

                toast.open('正在打开支付应用 ...');
                loading.open();

                // 禁用硬件返回键功能
                var enableBackButton = $ionicPlatform.registerBackButtonAction(function(event) {
                    event.preventDefault();
                }, 600);

                var promise;
                if (paymentName == 'WeChat') {

                    promise = api.post('/WxpayServlet.slrt', {
                        proName: 'WECHAT_PAY',
                        orderId: _.trim(orderId)
                    });

                } else if (paymentName == 'AliPay') {

                    promise = api.post('/AlipayServlet.slrt', {
                        proName: 'ALI_PAY',
                        orderId: _.trim(orderId)
                    });

                }

                promise.error(errorHandling)
                    .finally(function() {
                        // loading.close();
                    });

                return promise
                    .then(function(response) {

                        var promise = paymentMethods[paymentName](response.data);

                        promise.error(errorHandling);

                        return promise;
                    })
                    .finally(function() { 

                        loading.close();

                        // 恢复硬件返回键功能
                        setTimeout(function () {
                            enableBackButton();
                        }, 1000);
                    });

            }
        };

    return payService;
});
