angular.module('app.controllers').controller('productInfoCtrl', function(
    $scope, toast, modals, $stateParams, loadDataMixin, commentService,
    productService, errorHandling, userService, messageCenter, cartService, 
    $sce, $timeout, $cordovaFile, $cordovaFileOpener2, $cordovaFileTransfer, $q, $ionicLoading, MIME_MapTable, $rootScope
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        // 默认可卖
        sellAbled: true,

        // 获取商品信息
        loadData: function() {
            return productService.getProductInfo(ctrl.entityName)
                .success(function(response) {

                    // 获取商品信息
                    if (response.list[0].length) {

                        ctrl.baseData = response.list[0][0];

                        // 图片
                        ctrl.baseData.picUrl = window.APP_CONFIG.serviceAPI + ctrl.baseData.picUrl;

                        // 转义返回的文描html
                        ctrl.baseData.content = _.unescape(ctrl.baseData.content);

                        // 商品可卖
                        ctrl.sellAbled = true;
                    } else {
                        toast.open('商品已下架');

                        // 商品不可卖
                        ctrl.sellAbled = false;
                    }

                    // 获取商品评论
                    commentService.getComments(ctrl.entityName)
                        .success(function(response) {
                            if (response.list[0].length) {
                                ctrl.commentsList = response.list[0];
                            }
                        })
                        .error(errorHandling);
                })
                .error(errorHandling);
        },

        // 添加购物车
        addToCart: function () {

            userService.hasLogined()
                .success(function() {

                    cartService.addToCart(ctrl.baseData.sku)
                        .success(function() {
                            toast.open('加入购物车成功')
                        })
                        .error(errorHandling);

                })
                .error(function() {

                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                ctrl.init();
                            }, e.scope);
                        });

                });
        },

        // 购买
        buyNow: function () {

            userService.hasLogined()
                .success(function() {

                    modals.buyNow.open({
                        params: {
                            item: ctrl.baseData
                        }
                    });

                })
                .error(function() {
                    
                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                ctrl.init();
                            }, e.scope);
                        });

                });
        },

        // 视频配置信息
        config: {
            preload: 'none',
            sources: [
                {src: $sce.trustAsResourceUrl('http://static.videogular.com/assets/videos/videogular.mp4'), type: 'video/mp4'},
                {src: $sce.trustAsResourceUrl('http://static.videogular.com/assets/videos/videogular.webm'), type: 'video/webm'},
                {src: $sce.trustAsResourceUrl('http://static.videogular.com/assets/videos/videogular.ogg'), type: 'video/ogg'}
            ],
            tracks: [
                {
                    src: 'http://www.videogular.com/assets/subs/pale-blue-dot.vtt',
                    kind: 'subtitles',
                    srclang: 'en',
                    label: 'English',
                    default: ''
                }
            ],
            theme: {
                url: 'https://unpkg.com/videogular@2.1.2/dist/themes/default/videogular.css'
            }
        },







        /**
         * 文件下载
         * @param url 资源定位
         * @param targetPath 文件存储位置
         * @param fileName 文件名称
         * @param isOpen 下载完成后是否打开
         * @returns {Promise}
         */
        download: function (url, targetPath, fileName, isOpen) {
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
                        }
                }, function (error) {
                    // $ionicLoading.hide();
                    console.log('[download] download file occurred error :' + angular.toJson(error));

                    deferred.reject();

                    // deferred.reject({message: FileConstant('DOWNLOAD_FAIL')});
                }, function (progress) {
                    $timeout(function () {
                        // var downloadProgress = (progress.loaded / progress.total) * 100;
                        // $ionicLoading.show({template: '已经下载' + Math.floor(downloadProgress) + '%'});

                        // if (downloadProgress > 99) {
                        //     $ionicLoading.hide();
                        // }

                        var downloadProgress = (progress.loaded / progress.total) * 100;
                        if (downloadProgress > 99) {
                            toast.open('下载完成');
                        }
                    });
            });

          return deferred.promise;
        },

        /**
         * 附件下载
         * url 资源定位
         * fileName 文件名
         * @returns {Promise}
         */ 
        downloadAttachment: function () {
            var deferred = $q.defer();

            var url = 'http://cordova.apache.org/static/img/cordova_bot.png';
            var fileName = 'testImg.png';
            // var url = 'http://static.videogular.com/assets/videos/videogular.mp4';
            // var fileName = 'testVideo.mp4';
            var isOpen = true;

            url = encodeURI(url);
            // 存储路径
            var targetPath = $rootScope.downloadPath;
            console.log('存储路径' + targetPath);

            // IOS 平台，如果文件名称存在中文时需要转码
            if (ionic.Platform.isIOS()) {
                targetPath += encodeURI(fileName);
            } else {
                targetPath += fileName;
            }

            // 检验剩余内存是否可下载
            $cordovaFile.getFreeDiskSpace()
                .then(function (success) {
                    console.log('success, 剩余空间为---', success);

                    // 容量可下载
                    ctrl.download(url, targetPath, fileName, isOpen)
                        .then(function (success) {
                            deferred.resolve(success);
                        }, function (error) {
                            deferred.reject(error);
                    });

                }, function (error) {
                    console.log('error, 剩余空间为---', error);
            });

            return deferred.promise;
        }









    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
