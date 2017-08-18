// 修改全局配置对象
// -----------------------------------------------------------------------------

_.assign(window.APP_CONFIG, {
    os: ionic.Platform.platform(),
    osVersion: ionic.Platform.version(),
    serviceAPI: 'http://byt.smartcloudcn.com:81'
    // serviceAPI: 'http://app.banyuetan.org:88'
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
app.run(function($rootScope, localStorage, modals, $ionicPlatform, videoService, $cordovaFile) {

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

        // 有更新
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

                    if (!localVersion) {

                        // 当前应用被重新安装，则需要删除数据库的本地缓存数据
                        videoService.deleteAllCachedVideo()
                            .success(function() {c

                                // 删除本地当前文件夹中的所有缓存视频
                                /* 删除文件报错
                                if (window.cordova) {
                                    var cachedDirectory = $rootScope.downloadPath.split('bytDownload/cache/')[0];

                                    console.log(999, $rootScope.downloadPath, cachedDirectory);

                                    // $cordovaFile.removeDir(cachedDirectory, "bytDownload")
                                    //     .then(function (success) {
                                    //         console.log('啦啦，文件夹删除了。。。');
                                    //     }, function (error) {
                                    //         console.log('呜呜，文件夹删除报错了。。。');
                                    //         console.log('removeDir occurred error :' + angular.toJson(error));
                                    //     });

                                    // $cordovaFile.removeRecursively($rootScope.downloadPath, '')
                                    //     .then(function (success) {
                                    //         console.log('啦啦，全部删除了。。。');
                                    //     }, function (error) {
                                    //         console.log('呜呜，全部删除报错了。。。');
                                    //         console.log('removeRecursively occurred error :' + angular.toJson(error));
                                    //     });
                                }*/
                            });
                    }
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
    console.log('初始化下载目录');
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
                $rootScope.downloadPath = cordova.file.externalRootDirectory + folderName + '/';

                createDir(cordova.file.externalRootDirectory, folderName)
                    .then(function (success) {
                        $rootScope.downloadPath = success.nativeURL;

                        deferred.resolve(success);
                    }, function (error) {
                        console.log("[download] init android platform's download dir occurred error :" + angular.toJson(error));

                        deferred.reject(error);
                });
            } else {
                // 初始化IOS平台的下载目录
                $rootScope.downloadPath = cordova.file.documentsDirectory + folderName + '/';

                createDir(cordova.file.documentsDirectory, folderName)
                    .then(function (success) {
                        $rootScope.downloadPath = success.nativeURL;

                        deferred.resolve(success);
                    }, function (error) {
                        console.log("[download] init IOS platform's download dir occurred error :" + angular.toJson(error));

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
                console.log('[download] create dir occurred error :' + angular.toJson(error));

                deferred.reject(error);
        });

      return deferred.promise;
    }
});

app.run(function($rootScope, $timeout, $cordovaFile, $cordovaFileOpener2, $cordovaFileTransfer, 
    $q, $ionicLoading, MIME_MapTable, toast, videoService, errorHandling) {

    // 定义全局删除本地视频方法
    $rootScope.deleteCachedAttachment = function(fileNames) {

        if (window.cordova) {

            _.forEach(fileNames, function(fileName) {
                $cordovaFile.removeFile($rootScope.downloadPath, fileName)
                    .then(function (success) {
                        console.log(fileName, '删除了。。。');
                    }, function (error) {
                        console.log(fileName, '删除报错了。。。');
                        console.log('removeFile occurred error :' + angular.toJson(error));
                    });
            });
        }
    };

    // 定义全局下载视频方法
    $rootScope.downloadAttachment = function(item, $event) {
         $event.stopPropagation();

         if (item.cached) {
            toast.open('该视频已缓存成功，请到离线中心查看');
            return;
         }

        if (window.cordova) {

            // 当前正在下载
            item.downloading = true;

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

            console.log('存储路径' + targetPath);

            // 检验剩余内存是否可下载
            $cordovaFile.getFreeDiskSpace()
                .then(function (success) {
                    console.log('success, 剩余空间为---', success);

                    // 下载
                    download(url, targetPath, fileName, isOpen)
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
                                })
                                .error(errorHandling);
                        }, function (error) {
                            deferred.reject(error);
                    });

                }, function (error) {
                    console.log('error, 剩余空间为---', error);
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
    function download(url, targetPath, fileName, isOpen) {
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
                            console.log('[download] open file occurred error :' + angular.toJson(error));
                            deferred.reject();
                        });
                } else {
                    deferred.resolve(success);
                    console.log(2222, success);
                }
            }, function (error) {
                // $ionicLoading.hide();
                console.log('[download] download file occurred error :' + angular.toJson(error));

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
