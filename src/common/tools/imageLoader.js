/**
 * 图片加载，已加载图片会缓存在应用本地，非应用环境使用浏览器缓存
 */
angular.module('app.services')
    .factory('imageLoader', function ($ionicPlatform, api, localStorage) {
        // 本地存储预加载列表特征值
        var PRELOAD_HASH = 'preloadHash';
        // 本地存储预加载列表已加载计数
        var PRELOAD_COUNT = 'preloadCount';
        // 加载并行请求限制
        var LOAD_REQUEST_LIMIT = 5;
        // 预加载并行请求限制
        var PRELOAD_REQUEST_LIMIT = 3;
        // 图片缓存区容量
        var CACHE_QUOTA = 100 * 1024 * 1024;
        // 正在进行中的图片请求计数
        var requestCount = 0;
        // 请求队列
        var requestQueue = [];

        var imageCache = null;

        // 初始化图片缓存
        $ionicPlatform.ready(function() {
            if(window.cordova && window.ImgCache) {
                ImgCache.options.chromeQuota = CACHE_QUOTA;
                // if (ionic.Platform.isIOS()) {
                //     ImgCache.options.useDataURI = true;
                // }
                window.ImgCache.init(function () {
                    imageCache = window.ImgCache;
                    // 如果有等待执行的预加载任务，则开始预加载
                    if (preloadTask) {
                        preloadTask();
                        preloadTask = null;
                    }
                }, angular.noop);
            }
        });

        // 处理请求队列中第一个请求
        function processRequestInQueue() {
            if (requestQueue.length) {
                requestQueue.shift()();
            }
        }

        // 等待执行的预加载任务
        var preloadTask = null;

        // 生成对象特征值
        function generateHashCode(obj) {
            var str = JSON.stringify(obj);
            var hash = 0, i, chr, len;
            if (str.length === 0) return hash;
            for (i = 0, len = str.length; i < len; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0;
            }
            return hash;
        }

        return {
            // 加载图片
            load: function($image, src, successCallback) {
                var deferred = api.defer();

                // 使用 web 环境直接加载图片
                var useOnlineImage = function() {
                    var img = document.createElement('img');
                    requestCount++;
                    img.onload = function() {
                        $image[0].src = src;
                        if (successCallback) {
                            successCallback();
                        }
                        deferred.resolve();
                        requestCount--;
                    };
                    img.onerror = function() {
                        deferred.reject();
                        requestCount--;
                    };
                    img.src = src;
                };

                var loadHandler = function() {
                    if (imageCache) {
                        // 加载图片，图片没有本地缓存时先缓存至本地
                        ImgCache.useCachedFileWithSource($image, src, function() {
                            if (successCallback) {
                                successCallback();
                            }
                            deferred.resolve();
                        }, function() {
                            useOnlineImage();

                            // 使用 wifi 时缓存图片
                            var connection = navigator.connection;
                            if (connection && connection.type == Connection.WIFI) {
                                ImgCache.cacheFile(src);
                            }
                        });
                    } else {
                        useOnlineImage();
                    }
                };

                if (requestCount <= LOAD_REQUEST_LIMIT) {
                    loadHandler();
                } else {
                    requestQueue.push(loadHandler);
                }

                deferred.promise.finally(processRequestInQueue);

                return deferred.promise;
            },
            // 加载本地图片
            loadLocalImage: function($image, src, successCallback) {
                var deferred = api.defer();
                if (imageCache) {
                    ImgCache.useCachedFileWithSource($image, src, function() {
                        if (successCallback) {
                            successCallback();
                        }
                        deferred.resolve();
                    }, function() {
                        deferred.reject();
                    });
                } else {
                    deferred.reject();
                }
                return deferred.promise;
            },
            // 获取当前已缓存图片容量
            getCurrentSize: function() {
                if (imageCache) {
                    return (imageCache.getCurrentSize() / 1024 / 1024).toFixed(1) + 'MB';
                }
            },
            // 清除本地缓存
            clearCache: function() {
                var deferred = api.defer();
                if (imageCache) {
                    ImgCache.clearCache(function() {
                        // 清除本地预加载信息
                        localStorage.remove(PRELOAD_HASH);
                        localStorage.remove(PRELOAD_COUNT);

                        deferred.resolve({
                            status: 200,
                            data: {}
                        });
                    }, function(origin) {
                        deferred.reject();
                    });
                } else {
                    deferred.reject();
                }
                return deferred.promise;
            },
            // 预加载图片
            preload: function(imageList) {
                var hash = generateHashCode(imageList);
                var i = 0;
                var loaded = 0; // 已完成计数
                var interval = null;

                // 检查上一次是否有部分预加载已完成
                if (hash == localStorage.get(PRELOAD_HASH, 0)) {
                    // 加载未完成内容
                    loaded = +localStorage.get(PRELOAD_COUNT, 0);
                } else {
                    // 设置新预加载信息
                    localStorage.set(PRELOAD_HASH, hash);
                    localStorage.set(PRELOAD_COUNT, 0);
                }

                // 预加载图片
                var preloadImage = function(index) {
                    var src = imageList[index];
                    ImgCache.isCached(src, function(src, cached) {
                        if (cached) {
                            recordLoadedCount(index);
                        } else {
                            requestCount++;
                            ImgCache.cacheFile(src, function() {
                                requestCount--;
                                recordLoadedCount(index);
                                processRequestInQueue();
                            }, function() {
                                requestCount--;
                                processRequestInQueue();
                            });
                        }
                    });
                };

                // 记录已加载数量
                var recordLoadedCount = function(index) {
                    if (index > loaded) {
                        loaded = index;
                        // 每加载10张图或加载完成时记录一次加载进度
                        if (index % 10 === 0 || index === imageList.length -1) {
                            localStorage.set(PRELOAD_COUNT, index);
                        }
                    }
                };

                // 开始预加载
                var startPreload = function() {
                    var connection = navigator.connection;
                    if (!connection || connection.type != Connection.WIFI || interval)
                        return;
                    i = loaded;
                    if (i < imageList.length) {
                        interval = setInterval(function () {
                            if (connection.type != Connection.WIFI) {
                                stopPreload();
                                return;
                            }
                            // 限制并发请求数量
                            if (requestCount > PRELOAD_REQUEST_LIMIT)
                                return;

                            if (i < imageList.length) {
                                preloadImage(i);
                                i++;
                            }
                            if (i >= imageList.length) {
                                stopPreload();
                                document.removeEventListener("online", startPreloadWithDelay);
                                document.removeEventListener("offline", stopPreload);
                            }
                        }, 1000);
                    }
                };

                // 网络恢复后延时1秒开始预加载
                var startPreloadWithDelay = function() {
                    setTimeout(function () {
                        startPreload();
                    }, 1000);
                };

                // 停止预加载
                var stopPreload = function() {
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                };
                document.addEventListener("online", startPreloadWithDelay, false);
                document.addEventListener("offline", stopPreload, false);
                // 检查图片缓存是否已初始化，预加载延迟至图片缓存初始化后开始
                if (imageCache) {
                    startPreload();
                } else {
                    preloadTask = startPreload;
                }
            }
        };
    });
