/**
 * 淘宝平台
 */
angular.module('app.services').factory('taobaoOpenPlatform', function(
    api, messageCenter, taobaoService, $ionicPlatform
) {
    var

    initPromise = undefined,
    initWebServicePromise = undefined,
    loginPromise = undefined,
    logoutPromise = undefined,
    isCurrentLoginedPromise = undefined,
    openServiceSessionPromise = undefined,
    getUnreadCountPromise = undefined,

    // 存储用于观察未读消息数量的回调函数
    watchUnreadCountCallbacks = [],

    isOpenWatchUnreadCount = false,
    lastWatchUnreadCountResult = 0;

    var taobaoOpenPlatform = undefined;
    $ionicPlatform.ready(function() {
        taobaoOpenPlatform = window.TaobaoOpenPlatform;
    });

    function transformErrorInfoToApiResponseFormat(errorInfo) {
        errorInfo = errorInfo || {};

        return {
            stateCode: errorInfo.code ?  'TOP' + errorInfo.code : APP_STATE_CODE.unknownException
        };
    }

    function runWatchUnreadCountCallbacks(unreadCount) {
        setTimeout(function() {
            watchUnreadCountCallbacks.forEach(function(callback) {
                callback(unreadCount);
            });
        });
    }

    return {
        init: function(username, password) {
            if (!taobaoOpenPlatform) return api.reject();
            if (initPromise) {
                return initPromise;
            }
            else {
                return initPromise = taobaoService.userInfo()
                    .then(function(response) {
                        var data = response.data,
                            apiDeferred = api.defer();

                        taobaoOpenPlatform.init(
                            data.userid,
                            data.password,

                            function() {
                                apiDeferred.resolve({ data: data, status: 200 });
                            },

                            function(e) {
                                apiDeferred.reject(transformErrorInfoToApiResponseFormat(e));
                            }
                        );

                        return apiDeferred.promise;
                    })
                    .finally(function() {
                        initPromise = undefined;
                    });
            }
        },

        // 初始化客服信息 用户信息
        initWebServiceInfo: function(type, options){
            if (initWebServicePromise) {
                return initWebServicePromise;
            } else {
                return initWebServicePromise = taobaoService.serviceInfo(type)
                    .finally(function() {
                        initWebServicePromise = undefined;
                    });
            }

        },

        login: function(userId, password) {
            if (!taobaoOpenPlatform) return api.reject();
            if (loginPromise) {
                return loginPromise;
            }
            else {
                var apiDeferred = api.defer();

                taobaoOpenPlatform.login(
                    userId,
                    password,

                    function() {
                        apiDeferred.resolve();
                    },

                    function(e) {
                        apiDeferred.reject(transformErrorInfoToApiResponseFormat(e));
                    }
                );

                return loginPromise = apiDeferred.promise
                    .finally(function() {
                        loginPromise = undefined;
                    });
            }
        },

        logout: function() {
            if (!taobaoOpenPlatform) return api.reject();
            if (logoutPromise) {
                return logoutPromise;
            }
            else {
                var apiDeferred = api.defer();

                taobaoOpenPlatform.logout(
                    function() {
                        apiDeferred.resolve();
                    },

                    function(e) {
                        apiDeferred.reject(transformErrorInfoToApiResponseFormat(e));
                    }
                );

                return logoutPromise = apiDeferred.promise.finally(function() {
                    logoutPromise = undefined;
                });
            }
        },

        isCurrentLogined: function() {
            if (!taobaoOpenPlatform) return api.reject();
            if (isCurrentLoginedPromise) {
                return isCurrentLoginedPromise;
            }
            else {
                var apiDeferred = api.defer();

                taobaoOpenPlatform.isCurrentLogined(
                    function(isLogined) {
                        apiDeferred.resolve({
                            data: isLogined
                        });
                    },

                    function(e) {
                        apiDeferred.reject(transformErrorInfoToApiResponseFormat(e));
                    }
                );

                return isCurrentLoginedPromise = apiDeferred.promise.finally(function() {
                    isCurrentLoginedPromise = undefined;
                });
            }
        },

        openServiceSession: function(type, customOptions) {
            if (!taobaoOpenPlatform) return api.reject();
            if (openServiceSessionPromise) {
                return openServiceSessionPromise;
            }
            else {
                return openServiceSessionPromise = taobaoService.serviceInfo(type)
                    .then(function(response) {
                        var data = response.data,
                            apiDeferred = api.defer(),

                            options = {};

                        if (data.style) {
                            options.style = data.style;
                        }

                        if (data.avatar) {
                            options.avatar = data.avatar;
                        }

                        options = _.assign(options, customOptions);

                        setTimeout(function () {
                            taobaoOpenPlatform.openServiceSession(
                                // service id
                                data.serviceAccount,

                                // group id, {int}
                                parseInt(data.groupId) || 0,

                                // options
                                options,

                                function() {
                                    apiDeferred.resolve();
                                },

                                function(e) {
                                    apiDeferred.reject(transformErrorInfoToApiResponseFormat(e));
                                }
                            );
                        }, 300);

                        return apiDeferred.promise;
                    })
                    .success(function() {
                        runWatchUnreadCountCallbacks(0);
                    })
                    .finally(function() {
                        openServiceSessionPromise = undefined;
                    });
            }
        },

        getUnreadCount: function() {
            if (!taobaoOpenPlatform) return api.reject();
            if (getUnreadCountPromise) {
                return getUnreadCountPromise;
            }
            else {
                var apiDeferred = api.defer();

                taobaoOpenPlatform.getUnreadCount(
                    function(unreadCount) {
                        apiDeferred.resolve({
                            status: 200,
                            data: unreadCount
                        });
                    },

                    function(e) {
                        apiDeferred.reject(transformErrorInfoToApiResponseFormat(e));
                    }
                );

                return apiDeferred.promise.finally(function() {
                    getUnreadCountPromise = undefined;
                });
            }
        },

        /**
         * 观察未读消息会话
         * @param {function(<number|'exit'> unreadCount)} callback - 回调函数，若观察退出，则传入字符串 'exit'。
         */
        watchUnreadCount: function(callback) {
            if (!taobaoOpenPlatform) return;
            watchUnreadCountCallbacks.push(callback);

            if (isOpenWatchUnreadCount) {
                callback(lastWatchUnreadCountResult);
            }
            else {
                isOpenWatchUnreadCount = true;

                taobaoOpenPlatform.watchUnreadCount(
                    function(unreadCount) {
                        if (unreadCount === 'exit') {
                            isOpenWatchUnreadCount = false;
                        }

                        runWatchUnreadCountCallbacks(unreadCount);
                    },
                    function() {
                        isOpenWatchUnreadCount = false;
                        runWatchUnreadCountCallbacks('exit');
                    });
            }
        }
    };
});
