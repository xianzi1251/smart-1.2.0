/**
 * API 服务封装了 $http 服务，用于访问后台接口，
 * 它除了可以出发网络异常导致的错误外，还能识别业务异错误。
 */
angular.module('app.services').provider('api', function apiProvider() {
    var provider = this;

    // API 服务器根地址
    provider.serviceAddress = '';

    // 请求超时时间，默认一分钟
    provider.timeout = 1000 * 60;

    // 以 url 编码方式序列化对象
    provider.formatUrlParameter = function(obj) {
        // var result = '',
        //     jsonstr = JSON.stringify(obj);

        // if ( jsonstr && jsonstr !== '""' && jsonstr !== '{}' && jsonstr !== '[]' && jsonstr !== 'null' ) {
        //     result = 'param=' + encodeURIComponent(jsonstr);
        // }

        // return result;

        return jQuery.param(obj);
    };

    // 扩展 promise，为其添加 success 及 error 两个方法
    provider.extendPromise = function(promise, deferred) {
        promise._then = promise.then;

        promise.then = function() {
            var newPromise = this._then.apply(this, arguments);
            provider.extendPromise(newPromise, deferred);
            return newPromise;
        };

        promise.success = function(callback) {
            return this.then(function(response) {
                callback(response.data, response.status, response.headers, response.config);
                return response;
            });
        };

        promise.error = function(callback) {
            return this.then(null, function(response) {
                callback(response.data, response.status, response.headers, response.config);
                return promise;
            });
        };

        promise.cancel = function() {
            deferred && deferred.abort && deferred.abort('cancel');
        };

        return promise;
    };

    provider.$get = ['$http', '$q', 'messageCenter', function($http, $q, messageCenter) {
        var api = function(config) {
            var deferred  = api.defer(),
                canceller = $q.defer(),
                timeout   = config.timeout || provider.timeout,

                abortTimer;

            config.url = provider.serviceAddress + config.url;
            config.timeout = canceller.promise;

            $http(config).then(
                function(response) {
                    response.config = config;

                    // 接口类型
                    var proName = config.data.proName;

                    if (proName == 'comSender') {

                        // 发送验证码
                        var rrid = response.data.config.comSender.object.rrid;
                        if (rrid > 1) {
                            deferred.resolve(response);
                        } else {
                            response.data.message = '发送失败';
                            response.data.stateCode = -5;
                            deferred.reject(response);
                        }

                    } else if (proName == 'shoppingCart') {

                        // 购物车及结算中心获取当前商品
                        response.data = response.data.config.order.object.order;
                        deferred.resolve(response);

                    } else if (proName == 'creatOrder') {

                        // 生成订单
                        var obj = response.data.config.order.object.placedResult;

                        if (obj.success != 1) {
                            response.data.message = obj.info;
                            response.data.stateCode = obj.success;
                            deferred.reject(response);
                        }
                        else {
                            deferred.resolve(response);
                        }

                    } else if (proName == 'getCouponList' || proName == 'chooseCoupon') {

                        // 优惠券
                        response.data = response.data.config.order.object.order;
                        deferred.resolve(response);

                    } else if (proName == 'getMallProductList') {

                        // 商城商品列表
                        response.data = response.data.config.querySku.object.response;
                        deferred.resolve(response);

                    } else if (proName == 'WECHAT_LOGIN' || proName == 'WECHAT_PAY' || proName == 'ALI_PAY') {

                        // 微信登录／微信支付／支付宝支付
                        deferred.resolve(response);

                    } else if (proName == 'IAP_RECHARGE') {

                        // IAP支付
                        deferred.resolve(response);

                    } else {

                        // 接口类型
                        var obj = response.data.scommerce[proName].object;

                        if (obj.success != 1) {
                            response.data.message = obj.info;
                            response.data.stateCode = obj.success;
                            deferred.reject(response);
                        }
                        else {
                            response.originalData = response.data;
                            response.data = response.originalData.scommerce[proName];
                            deferred.resolve(response);
                        }

                    }

                    // if stateCode is undefined, null or 0, is success.
                    // if (response.data && response.data.stateCode) {
                    //     // 出现未登录错误时，清除应用内的的用户信息
                    //     if (response.data.stateCode == APP_STATE_CODE.notLogin && window.APP_USER.id) {
                    //         messageCenter.publishMessage('logout');
                    //     }
                    //     deferred.reject(response);
                    // }
                    // else {
                    //     response.originalData = response.data;
                    //     response.data = response.originalData.data;
                    //     deferred.resolve(response);
                    // }
                },
                function(response) {
                    response.config = config;
                    deferred.reject(response);
                }
            )
            .finally(function() {
                abortTimer && clearTimeout(abortTimer);
            });

            // 中止请求
            deferred.abort = function(reason) {
                canceller.resolve(reason);
            };

            if (typeof timeout === 'number') {
                abortTimer = setTimeout(function() {
                    deferred.abort('timeout');
                }, timeout);
            }
            else if (typeof timeout.then === 'function') {
                timeout.then(deferred.abort);
            }

            return deferred.promise;
        };

        api.get = function(url, data, config) {
            var paramsIndex, dataStr;

            if (data) {
                dataStr = provider.formatUrlParameter(data);
                url += '?' + dataStr;
            }

            return api(angular.extend(config || {}, {
                method: 'get',
                url: url,
                data: data
            }));
        };

        api.post = function(url, data, config) {
            return api(angular.extend(config || {}, {
                method: 'post',
                url: url,
                data: data
            }));
        };

        api.reject = function(code, message) {
            var response;

            if (code && typeof code === 'object') {
                response = code;
            }
            else {
                response = {
                    data: {
                        stateCode: code,
                        message: message
                    },
                    status: 200
                };
            }

            return api.extendPromise($q.reject(response));
        };

        api.when = function(data) {
            return api.extendPromise($q.when({
                data: data
            }));
        };

        /**
         * 构建一个 deferred 对象，该对象的 promise 已经过扩展，具有和 api 服务所返回的 promise 相同的使用方式。
         * 另外该 deferred 的 reject 方法可接收三个参数，分别是错误编码，错误信息及建议的错误显示方式。
         *
         * 建议：为了和由 $q 所创建的 deferred 区分开，建议使用如下命名：
         *
         *     var apiDeferred = api.defer();
         */
        api.defer = function() {
            var deferred = $q.defer();

            deferred.promise = api.extendPromise(deferred.promise, deferred);

            deferred._resolve = deferred.resolve;
            deferred.resolve = function(response) {
                response = response || {
                    data: {},
                    status: 200
                };

                return this._resolve(response);
            };

            deferred._reject = deferred.reject;
            deferred.reject = function(code, message) {
                var response;

                if (code && typeof code === 'object') {
                    response = code;
                }
                else {
                    response = {
                        data: {
                            stateCode: code,
                            message: message
                        },
                        status: 200
                    };
                }

                this._reject(response);
            };

            return deferred;
        };

        api.all = function(promises) {
            var promise = $q.all(promises);
            return api.extendPromise(promise);
        };

        api.extendPromise = provider.extendPromise;

        return api;
    }];
});
