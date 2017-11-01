// 修改全局配置对象
// -----------------------------------------------------------------------------

_.assign(window.APP_CONFIG, {
    os: ionic.Platform.platform(),
    osVersion: ionic.Platform.version(),
    // serviceAPI: 'http://byt.smartcloudcn.com:81'
    serviceAPI: 'http://app.banyuetan.org:88',

    // sms加密
    SIGN_KEY: 'KDl85_b#agjkloUh#r1277byt'
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

// 初始化数据统计
app.run(function(analytics) {
    analytics.init();
});

// 初始化iap支付
app.run(function($ionicPlatform, smartIap) {
    $ionicPlatform.ready(function() {
        if (window.store && ionic.Platform.isIOS()) {
            smartIap.initStore();
        }
    });
});

// 版本检测
app.run(function($rootScope, localStorage, modals, $ionicPlatform, videoService, $cordovaFile, globalService, popup) {

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

        // 检测是否有新版本
        globalService.checkUpdate().success(function(response) {
            var data = response.list[0][0];

            if (!data || !data.version) {
                return;
            }

            // 根据version判断是否需要更新
            var version = data.version.split('.');
            var isUpdate = false;
            for (var i in currentVersion) {
                if (currentVersion[i] < version[i]) {
                    isUpdate = true;
                    break;
                }
            }

            // url地址
            var url = '';
            if (ionic.Platform.isAndroid()) {
                url = data.androidUrl;
            } else {
                url = data.iosUrl;
            }

            var description =  _.unescape(data.description).replace(/;/g, ';<br />');

            // 有新版本更新
            if (isUpdate) {
                if (data.force) {
                    //强制更新时 屏蔽所有操作
                    $ionicPlatform.registerBackButtonAction(function(event) {
                        event.preventDefault();
                    }, 600);
                }

                // 判断是否强制更新
                var promise = data.force ? popup.updateAlert(description, url) : popup.updateConfirm(description);
                promise.then(function(res) {
                    if (res) {
                        cordova.InAppBrowser.open(url, '_system');
                    }
                });
            }
        });

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

// 初始化app的下载目录
app.run(function($rootScope, $q, $cordovaFile, $ionicPlatform) {
    var deferred = $q.defer();
    var folderName = 'bytDownload/cache';
    // console.log('初始化下载目录');
    /**
     * cordova.file.dataDirectory 不同平台对应位置如下
     *  android:'data/data/<app-id>/files/'
     *  IOS:'/var/mobile/Applications/<UUID>/Library/NoCloud/'
     */
    
    $ionicPlatform.ready(function() {
        if (window.cordova) {

            /**
             * 因android平台,apk类型的文件放到cordova.file.dataDirectory下,将无法正常安装
             */
            if (ionic.Platform.isAndroid()) {
                // 初始化android平台的下载目录
                $rootScope.downloadPath = cordova.file.externalApplicationStorageDirectory + folderName + '/';

                createDir(cordova.file.externalApplicationStorageDirectory, folderName)
                    .then(function (success) {
                        $rootScope.downloadPath = success.nativeURL;

                        deferred.resolve(success);
                    }, function (error) {
                        // console.log("[download] init android platform's download dir occurred error :" + angular.toJson(error));

                        deferred.reject(error);
                });
            } else {
                // 初始化IOS平台的下载目录
                $rootScope.downloadPath = cordova.file.cacheDirectory + folderName + '/';

                createDir(cordova.file.cacheDirectory, folderName)
                    .then(function (success) {
                        $rootScope.downloadPath = success.nativeURL;

                        deferred.resolve(success);
                    }, function (error) {
                        // console.log("[download] init IOS platform's download dir occurred error :" + angular.toJson(error));

                        deferred.reject(error);
                    });
            }
        }
    });

    // 创建下载视频的文件夹
    function createDir(path, directory) {
        var deferred = $q.defer();

        $cordovaFile.createDir(path, directory, true)
            .then(function (success) {
                deferred.resolve(success);
            }, function (error) {
                // console.log('[download] create dir occurred error :' + angular.toJson(error));

                deferred.reject(error);
        });

      return deferred.promise;
    }
});

app.run(function($rootScope, $timeout, $cordovaFile, $cordovaFileOpener2, $cordovaFileTransfer, 
    $q, $ionicLoading, MIME_MapTable, toast, videoService, errorHandling, messageCenter) {

    // 需要下载的列表
    $rootScope.needDownloadList = [];

    // 定义全局删除本地视频方法
    $rootScope.deleteCachedAttachment = function(fileNames) {

        if (window.cordova) {

            _.forEach(fileNames, function(fileName) {
                $cordovaFile.removeFile($rootScope.downloadPath, fileName)
                    .then(function (success) {
                        // console.log(fileName, '删除了。。。');
                    }, function (error) {
                        // console.log(fileName, '删除报错了。。。');
                        // console.log('removeFile occurred error :' + angular.toJson(error));
                    });
            });
        }
    };

    // 定义全局下载视频方法
    $rootScope.downloadAttachment = function(item) {

        if (window.cordova) {

            // 下载信息
            var url = item.mp4Url,   // 视频url
                fileType = url.substring(url.lastIndexOf('.') + 1, url.length),   // 文件后缀
                fileName = item.title + item.entityName + '.' + fileType;    // 视频名称

            var deferred = $q.defer();

            var isOpen = false;

            url = encodeURI(url);
            // 存储路径
            var targetPath = $rootScope.downloadPath;

            // IOS 平台，如果文件名称存在中文时需要转码
            if (ionic.Platform.isIOS()) {
                targetPath += encodeURI(fileName);
            } else {
                targetPath += fileName;
            }

            // console.log('存储路径' + targetPath);

            // 检验剩余内存是否可下载
            $cordovaFile.getFreeDiskSpace()
                .then(function (success) {
                    // console.log('success, 剩余空间为---', success);

                    // 下载
                    download(url, targetPath, fileName, isOpen, item)
                        .then(function (success) {
                            deferred.resolve(success);

                            // 访问缓存视频的接口
                            videoService.downloadVideo(item.id, targetPath)
                                .success(function() {
                                    toast.open(item.title + ' 缓存成功，请到离线中心查看');

                                    // 暂时修改缓存状态，不调用接口
                                    item.cached = 1;

                                    // 下载完成，非下载状态
                                    item.downloading = false;

                                    _.remove($rootScope.needDownloadList, function(rootItem) {
                                        return rootItem.id == item.id;
                                    });

                                    messageCenter.publishMessage('cached.success', {
                                        item: item
                                    });
                                })
                                .error(errorHandling)
                                .error(function() {
                                    messageCenter.publishMessage('cached.failed', {
                                        item: item
                                    });
                                });
                        }, function (error) {
                            deferred.reject(error);
                    });

                }, function (error) {
                    toast.open('手机内存不足');
                    // console.log('error, 剩余空间为---', error);
            });

            return deferred.promise;
        }
    };

    /**
     * 文件下载
     * @param url 资源定位
     * @param targetPath 文件存储位置
     * @param fileName 文件名称
     * @param isOpen 下载完成后是否打开
     * @returns {Promise}
     */
    function download(url, targetPath, fileName, isOpen, item) {
        var deferred = $q.defer();

        var trustAllHosts = true;
        // 选项
        var options = {};
        //添加headers信息
        var headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'accept-encoding': 'gzip,deflate,sdch',
            'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6'
        };
        options.headers = headers;

        // $ionicLoading.show({template: '已经下载0%'});
        $cordovaFileTransfer.download(url, targetPath, options, trustAllHosts)
            .then(function (success) {
                // $ionicLoading.hide();

                if (isOpen) {
                    // 文件类型
                    var fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);

                    //打开下载文件
                    $cordovaFileOpener2.open(targetPath, MIME_MapTable(fileType))
                        .then(function (success) {
                            deferred.resolve(success);
                        }, function (error) {
                            // console.log('[download] open file occurred error :' + angular.toJson(error));
                            deferred.reject();
                        });
                } else {
                    deferred.resolve(success);
                    // console.log(2222, success);
                }
            }, function (error) {
                // $ionicLoading.hide();
                // console.log('[download] download file occurred error :' + angular.toJson(error));

                messageCenter.publishMessage('cached.failed', {
                    item: item
                });

                deferred.reject();

                // deferred.reject({message: FileConstant('DOWNLOAD_FAIL')});
            }, function (progress) {
                // $timeout(function () {
                //     var downloadProgress = (progress.loaded / progress.total) * 100;
                //     $ionicLoading.show({template: '已经下载' + Math.floor(downloadProgress) + '%'});

                //     if (downloadProgress > 99) {
                //         $ionicLoading.hide();
                //     }
                // });
        });

      return deferred.promise;
    }

});

// 平台相关的路由状态
app.constant('platformStates', {});

//平台相关的在每一个 tab 项下都要提供的状态配置
app.constant('platformStatesForEveryTab', {

});
