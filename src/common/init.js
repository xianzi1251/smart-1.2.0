// 声明放在全局空间中的配置对象
// -----------------------------------------------------------------------------

// 应用程序配置
window.APP_CONFIG = {};

// 应用国际化配置
window.APP_LANG = {};

// 应用状态码配置
window.APP_STATE_CODE = {};

// 应用当前登录用户信息
window.APP_USER = {};


// angular 模块声明
// -----------------------------------------------------------------------------

angular.module('app.services', []);
angular.module('app.directives', []);
angular.module('app.controllers', []);
angular.module('app.filters', []);
angular.module('app.templates', []);
angular.module('ngMessages', []);

var app = angular.module('app', [
    'ionic',
    'ngMessages',
    "cmSwitch",
    'pascalprecht.translate',
    'tabSlideBox',
    'ionic-datepicker',
    'flow',
    'ngCordova',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'com.2fdevs.videogular.plugins.overlayplay',
    'app.services',
    'app.directives',
    'app.controllers',
    'app.filters',
    "app.templates"
]);


// 默认的初始化操作
// -----------------------------------------------------------------------------

// 配置虚拟键盘插件
app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
    });
});

// 配置国际化
app.config(function($translateProvider) {
    if (_.isEmpty(APP_LANG)) {
        return;
    }

    _.forEach(APP_LANG, function(textOptions, langName) {
        $translateProvider.translations(langName, textOptions);
    });

    $translateProvider.preferredLanguage(APP_CONFIG.language);
});

// 设置本地存储的前缀
app.config(function(localStorageProvider) {
    localStorageProvider.prefix = 'banyuetan-app-';
});

app.run(function($rootScope, $state, userService, nativeTransition, modals, messageCenter, $ionicHistory, errorHandling) {
    // 定义全局的返回方法
    $rootScope.goBack = function() {
        nativeTransition.backward();
        if ($ionicHistory.backView()) {
            $rootScope.$ionicGoBack();
        } else {
            $ionicHistory.nextViewOptions({
                disableAnimate: true
            });
            $state.go('tabs.index');
        }
    };

    // 状态转换前检测是否登录
    function goAfterLogined(state) {
        return function() {

            userService.hasLogined()
                .success(function() {
                    $state.go(state);
                })
                .error(function() {
                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function(event, userInfo) {
                                setTimeout(function() {
                                    $state.go(state);
                                }, 0);
                            }, e.scope);
                        });
                });
        };
    }

    // 跳转购物车
    $rootScope.goShoppingCart = goAfterLogined('tabs.shoppingCart');

    // 跳转购买记录
    $rootScope.goPurchasedList = goAfterLogined('tabs.purchasedList');

    // 跳转个人中心
    $rootScope.goUser = goAfterLogined('tabs.user');

});

// 设置 unique
app.run(function(unique) {
    APP_CONFIG.unique = APP_CONFIG.unique || unique;
});

// 设置用户信息
app.run(function($ionicPlatform, localStorage, messageCenter, $rootScope) {
    _.assign(APP_USER, localStorage.get('user'));

    // 用户登录以及获取用户信息后，将响应的数据放入到 APP_USER 中，并缓存在本地
    messageCenter.subscribeMessage('login', function(event, userInfo) {

        var user = {
            id: userInfo.object.cosmosPassportId4session,
            userSession: userInfo.object.usersesId,
            loginName: userInfo.object.displayName,
            nickName: userInfo.object.nickName,
            thirdPartylogin: false,
            cosmosPassportId: userInfo.object.cosmosPassportId4session,
            bytSwitch: userInfo.object.bytSwitch
        };
        _.assign(APP_USER, user);

        localStorage.set('user', APP_USER);
    });

    // 用户微信登录以及获取用户信息后，将响应的数据放入到 APP_USER 中，并缓存在本地
    messageCenter.subscribeMessage('wechatLogin', function(event, userInfo) {

        var user = {
            id: userInfo.userId,
            userSession: userInfo.userSession,
            loginName: userInfo.name,
            nickName: userInfo.name,
            thirdPartylogin: true,
            cosmosPassportId: userInfo.userId,
            bytSwitch: userInfo.bytSwitch
        };
        _.assign(APP_USER, user);

        localStorage.set('user', APP_USER);
    });

    // 用户登出后，清空 APP_USER 及本地缓存的用户信息
    messageCenter.subscribeMessage('logout', function(event, userData) {
        for (var key in APP_USER) {
            APP_USER[key] = undefined;
        }

        localStorage.set('user', APP_USER);
    });
});

// 配置 api 服务
app.config(function($httpProvider, apiProvider) {
    // 配置服务器根路径
    apiProvider.serviceAddress = APP_CONFIG.service;

    // 自定义请求参数编码
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ?
            apiProvider.formatUrlParameter(data) : data;
    }];

    // 设置请求超时为20秒
    apiProvider.timeout = 1000 * 20;

    // 更加健壮的响应数据转换器，当响应数据为 json 字符串时，将按照 json 格式进行解析，否则直接当作字符串返回。
    var defaultJsonTransformResponse = $httpProvider.defaults.transformResponse[0];
    $httpProvider.defaults.transformResponse = [function(data, headers) {
        try {
            return defaultJsonTransformResponse(data, headers);
        } catch (e) {
            return data;
        }
    }];

    // 添加请求头部属性
    _.assign($httpProvider.defaults.headers.common, {
        // 'Cache-Control': 'no-cache',
        appkey: function() {
            return APP_CONFIG.appkey;
        },
        os: function() {
            return APP_CONFIG.os;
        },
        osVersion: function() {
            return APP_CONFIG.osVersion;
        },
        appVersion: function() {
            return APP_CONFIG.appVersion;
        },
        unique: function() {
            return APP_CONFIG.unique;
        },
        subsiteId: function() {
            return APP_CONFIG.subsiteId;
        },
        language: function() {
            return APP_CONFIG.language;
        },
        channel: function() {
            return APP_CONFIG.channel;
        },
        userid: function() {
            return APP_USER.id;
        },
        userSession: function() {
            return APP_USER.userSession;
        },
        manufacturer: function() {
            return window.device && window.device.manufacturer;
        },
        model: function() {
            return window.device ? window.device.model : window.SensorsData && SensorsData._.detector.device.name;
        },
        screenWidth: function() {
            return window.screen.width;
        },
        screenHeight: function() {
            return window.screen.height;
        },
        networkType: function() {
            return navigator.connection && navigator.connection.type;
        }
    });
});

// 注册商品所配置的路由状态，同时也会根据 statesForEveryTab 中的配置内容生成在每一个 tabs 下的状态配置，并放入 states 中。
app.config(function($stateProvider, $urlRouterProvider, tabs, states, platformStates, modals, statesForEveryTab, platformStatesForEveryTab) {
    _.merge( states, platformStates);
    var allStatesForEveryTab = _.merge({},statesForEveryTab, platformStatesForEveryTab);

    _.forEach(allStatesForEveryTab, function(config, name) {
        _.forEach(tabs, function(tabConfig) {
            var nameForTab = 'tabs.' + tabConfig.name + _.capitalize(name),
                configForTab = _.merge({
                    views: {}
                }, _.omit(config, ['templateUrl', 'controller']));

            configForTab.views[tabConfig.name] = {
                templateUrl: config.templateUrl,
                controller: config.controller
            };

            configForTab.url = '/' + tabConfig.name + _.capitalize(configForTab.url);
            states[nameForTab] = configForTab;
        });
    });

    _.forEach(states, function(config, name) {
        $stateProvider.state(name, config);
    });

    // $urlRouterProvider.otherwise('/tabs/index');

});

// 设置初始状态
app.run(function($state) {
    if (!window.location.hash || /^#\/$/.test(window.location.hash) || /^#\/modals/.test(window.location.hash)) {
        $state.go('tabs.index');
    }
});

// 处理弹出层配置，将所配置的弹出层注册到 $rootScope 下的 modals 命名空间内
app.run(function($rootScope, $state, $ionicModal, $controller, modals, messageCenter) {

    // 判断所传入的对象是否是 angular 中的 $scope 对象
    function isScope(scope) {
        return scope.$new && scope.$id;
    }

    // 将 modals 放入 $rootScope 中，方便在模板页面中调用
    $rootScope.modals = modals;

    var defaultOptions = {
        scope: $rootScope,
        animation: 'slide-in-right',
        backdropClickToClose: true,
        hardwareBackButtonClose: true
    };

    _.forEach(modals, function(modal, name) {

        modal = _.defaults(modal, defaultOptions);

        _.assign(modal, {
            $modal: undefined,
            $scope: undefined,

            open: function(options) {
                // 防止 modal 重复开启
                if (modals.$showModals[name]) {
                    return;
                }

                var self = this;
                modals.$showModals[name] = self;

                options = angular.extend({}, modal, options);

                var scope = options.scope.$new();
                self.$scope = scope;

                if (options.controller) {
                    var controller = $controller(options.controller, {
                        $scope: scope,
                        $params: options.params
                    });

                    if (options.controllerAs) {
                        scope[options.controllerAs] = controller;
                    }
                }

                scope.$on('modal.hidden', function() {
                    self.close();
                });

                scope.$on('$destroy', function() {
                    messageCenter.publishMessage('modal.close', modal.title);
                });

                modal.popStateListener = function(e) {
                    if (name == e.state.name) {
                        window.removeEventListener("popstate", modal.popStateListener);
                        modal.popStateListener = null;
                        modal.close();
                    }
                };

                window.addEventListener("popstate", modal.popStateListener);

                setTimeout(function() {
                    window.history.replaceState({
                        name: name
                    }, null, null);
                    window.history.pushState({}, modal.title, '#/modals/' + name);
                });

                return $ionicModal.fromTemplateUrl(options.path, function($modal) {
                    $modal.show();
                    self.$modal = $modal;
                    messageCenter.publishMessage('modal.open', modal.title);
                }, {
                    scope: scope,
                    animation: options.animation || '',
                    backdropClickToClose: options.backdropClickToClose,
                    hardwareBackButtonClose: options.hardwareBackButtonClose
                });
            },

            close: function() {
                if (modal.popStateListener) {
                    window.removeEventListener("popstate", modal.popStateListener);
                    modal.previousState = null;
                    modal.popStateListener = null;
                    window.history.back();
                }

                var $modal = this.$modal,
                    $scope = this.$scope;

                this.$modal = undefined;
                this.$scope = undefined;

                if ($modal) $modal.remove();
                if ($scope) $scope.$destroy();

                delete modals.$showModals[name];
            }
        });
    });

    // 存放所有当前已显示的 modals
    modals.$showModals = {};
});

// 定义初始化方式
(function() {
    function getChannel(callback) {
        if (!(window.plugins && window.plugins.preference)) {
            callback();
            return;
        }

        // 从 config.xml 中获取 channel
        window.plugins.preference.get('CHANNEL', function(value) {
            _.assign(window.APP_CONFIG, {
                channel: value
            });
            callback();
        }, callback);
    }

    function start() {
        angular.bootstrap(document.body, ['app'], {
            strictDi: true
        });
    }

    window.appStart = function() {
        document.addEventListener("deviceready", function() {
            getChannel(start);
        }, false);
    };
    window.angularBootstrap = start;
})();
