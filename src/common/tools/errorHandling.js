/**
 * 默认的业务操作失败时的处理行为
 */
angular.module('app.services').provider('errorHandling', function() {

    var provider = this;

    /**
     * 根据接口响应的错误信息调用对应的错误处理器，并返回处理器所返回的内容。
     */
    provider.errorAssign = function(data, status, headers, config, designees) {
        function runDesignee(name) {
            return designees[name] && designees[name](data, status, headers, config);
        }
        
        // 请求终止
        if (status === 0) {
            // 中止标识
            var reason = config.timeout.$$state.value;

            // 取消请求
            if (reason === 'cancel') {
                return runDesignee('cancel');
            }
            // 超时
            else if (reason === 'timeout') {
                return runDesignee('timeout');
            }
            // 网络异常
            else {
                return runDesignee('network');
            }
        }
        // 请求异常
        else if (status < 200 || status >= 300) {
                return runDesignee('http');
        }
        // 业务异常
        else if (data && data.stateCode) {
            // // 用户未登录
            // if (data.stateCode == APP_STATE_CODE.notLogin) {
            //     return runDesignee('notLogin');
            // }
            // // 其它异常
            // else {
            //     return runDesignee('other');
            // }
            return runDesignee('other');
        }
        // 其它异常
        else {
            return runDesignee('other');
        }
    };

    // @ngInject
    provider.$get = function(toast, modals, $translate) {

        function openToast(text) {
            text && toast.open(text);
        }

        // 默认的错误处理操作
        var defaultErrorHandlers = {
            // 处理请求被放弃
            cancel: function(data, status, headers, config, designees) {
                ;
            },

            // 处理网络异常
            network: function(data, status, headers, config, designees) {
                $translate('stateTexts.networkAnomaly').then(function(text) {
                    openToast(text);
                });
            },

            // 请求超时
            timeout: function(data, status, headers, config, designees) {
                $translate('stateTexts.timeoutException').then(function(text) {
                    openToast(text);
                });
            },

            // 处理 HTTP 异常
            http: function(data, status, headers, config, designees) {
                $translate('stateTexts.serviceException').then(function(text) {
                    openToast(text);
                });
            },

            // 处理用户未登陆异常
            notLogin: function(data, status, headers, config, designees) {
                modals.login.open();
                openToast(data.message);
            },

            // 处理其它异常操作
            other: function(data, status, headers, config, designees) {
                openToast(data.message);
            }
        };

        // 默认错误处理器
        function errorHandling(data, status, headers, config) {
            provider.errorAssign(data, status, headers, config, defaultErrorHandlers);
        }

        // 自定义错误处理器
        errorHandling.custom = function(errorHandlers) {
            errorHandlers = _.merge({}, defaultErrorHandlers, errorHandlers);

            return function errorHandling(data, status, headers, config) {
                provider.errorAssign(data, status, headers, config, errorHandlers);
            };
        };

        return errorHandling;
    };
});
