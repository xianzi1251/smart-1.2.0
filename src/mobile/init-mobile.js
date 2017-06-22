// 修改全局配置对象
// -----------------------------------------------------------------------------

_.assign(window.APP_CONFIG, {
    os: ionic.Platform.platform(),
    osVersion: ionic.Platform.version(),
    // serviceAPI: 'http://byt.smartcloudcn.com'
    serviceAPI: 'http://app.banyuetan.org:88'
});


// 手机端初始化操作
// -----------------------------------------------------------------------------

var app = angular.module('app');

// 配置 ionic
app.config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.backButton.text('');
    if (ionic.Platform.isIOS()) {
        $ionicConfigProvider.scrolling.jsScrolling(true);
    } else {
        $ionicConfigProvider.scrolling.jsScrolling(false);
    }
});

// 键盘附件条
app.run(function($ionicPlatform, modals) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
    });
});

// 版本检测
app.run(function($rootScope, localStorage, modals, $ionicPlatform) {

    // 当前是否新版本
    var isUpgrade = false;
    // 获取本地存储的应用版本号
    var localVersion = localStorage.get('appVersion');
    // 当前内存版本号
    var currentVersion = window.APP_CONFIG.appVersion.split('.');
    // 如果存在则比对版本号
    if (localVersion) {
        localVersion = localVersion.split('.');
        for (var i in localVersion) {
            if (localVersion[i] < currentVersion[i]) {
                isUpgrade = true;
                break;
            }
        }
    } else {
        isUpgrade = true;
    }

    var deregistration = $rootScope.$on('$ionicView.afterEnter', function() {
        // 当前应用为新版本  开启引导图
        if (isUpgrade) {
            setTimeout(function () {

                // 显示新手导航
                modals.upgrade.open({
                    backdropClickToClose: false,
                    hardwareBackButtonClose: false
                });

                localStorage.set('appVersion', window.APP_CONFIG.appVersion);

            });
        } 

        setTimeout(function() {
            $ionicPlatform.ready(function() {
                if (navigator.splashscreen) navigator.splashscreen.hide();
            });
        }, 500);

        deregistration();
    });
});

// Android处理返回键
app.run(function($ionicPlatform, $rootScope, $ionicHistory, $translate, nativeTransition, toast) {
    $ionicPlatform.ready(function() {
        var exitToast = false;
        var backButtonHandler = function(e) {
            if (nativeTransition.isAnimating()) {
                return;
            }
            var back = $('.back-button:visible');

            if (back.length) {
                $rootScope.goBack();
            } else if ($ionicHistory.backView()) {
                $rootScope.$ionicGoBack();
            } else {
                if (exitToast) {
                    ionic.Platform.exitApp();
                } else {
                    toast.open($translate.instant('exitApp'), 3000);
                    exitToast = true;
                    setTimeout(function() {
                        exitToast = false;
                    }, 3000);
                }
            }
        };
        $ionicPlatform.registerBackButtonAction(backButtonHandler, 101);
    });
});

// 平台相关的路由状态
app.constant('platformStates', {});

//平台相关的在每一个 tab 项下都要提供的状态配置
app.constant('platformStatesForEveryTab', {

});
