angular.module('app.controllers').controller('courseVideoCtrl', function(
    $scope, $state, $stateParams, nativeTransition, errorHandling, commentService, loading, productService,
    toast, loadDataMixin, $ionicScrollDelegate, $rootScope, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        entityName: $stateParams.entityName,

        // 默认可卖
        sellAbled: true,

        tabAction: 0,

        // tab内容
        infoTabs: [
            {
                label: '详情',
                active: true
            },
            {
                label: '目录',
                active: false
            }
        ],

        // 切换tab
        changeTab: function(index) {
            ctrl.tabAction = index;

            for (var i in ctrl.infoTabs) {
                ctrl.infoTabs[i].active = false;

                if (i == index) {
                    ctrl.infoTabs[i].active = true;
                    $ionicScrollDelegate.$getByHandle('courseVideoScroll').scrollTop(true);
                    $ionicScrollDelegate.$getByHandle('courseVideoScroll').resize();
                }
            }
        },

        // 获取套装商品信息
        init: function() {

            ctrl.finishLoading = false;
            loading.open();

            ctrl.baseData = [];
            ctrl.courseList = [];
            ctrl.commentsList = [];

            ctrl.activeVideoItem = '';

            return productService.getProductInfo(ctrl.entityName)
                .success(function(response) {

                    // 获取套装商品作者介绍
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

                    // 获取套装商品的相关课程
                    productService.getSuitCourses(ctrl.entityName)
                        .success(function(response) {
                            if (response.list[0].length) {
                                ctrl.courseList = response.list[0];

                                _.forEach(ctrl.courseList, function(item, index) {
                                    item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                                    item.active = false;

                                    // 默认显示第一个视频
                                    if (index == 0) {
                                        ctrl.activeVideoItem = item;
                                        item.active = true;
                                    }

                                    // 获取当前还处于缓存状态的video，修改状态为下载中
                                    _.forEach($rootScope.needDownloadList, function(rootItem) {

                                        if (item.id == rootItem.id) {
                                            item.downloading = rootItem.downloading;
                                        }
                                    });
                                });
                            }

                            // 商品评论
                            commentService.getComments(ctrl.entityName)
                                .success(function(response) {
                                    if (response.list[0].length) {
                                        ctrl.commentsList = response.list[0];
                                    }
                                })
                                .error(errorHandling)
                                .finally(function() {
                                    ctrl.finishLoading = true;
                                    loading.close();
                                });
                        })
                        .error(errorHandling);
                })
                .error(errorHandling);
        },

        // 切换观看视频，如当前播放的视频与选择播放的视频相同，则无操作
        changeVideo: function(item, $index) {

            if (item.entityName != ctrl.activeVideoItem.entityName) {

                loading.open();

                _.forEach(ctrl.courseList, function(item, index) {

                    item.active = false;

                    if (index == $index) {

                        ctrl.activeVideoItem = item;
                        item.active = true;

                        setTimeout(function() {
                            loading.close();
                        }, 2000);
                    }
                });
            }
        },

        // 下载视频
        downloadVideo: function(item, $event) {

            $event.stopPropagation();

            if (item.cached) {
                toast.open('该视频已缓存成功，请到离线中心查看');
                return;
             } else if (item.downloading) {
                toast.open('该视频正在缓存，请稍等');
                return;
             }

            // 当前正在下载
            item.downloading = true;

            $rootScope.needDownloadList.push(item);

            $rootScope.downloadAttachment(item);

        }

    });

    // 订阅某个视频缓存成功
    messageCenter.subscribeMessage('cached.success', function(event, data) {

        _.forEach(ctrl.courseList, function(item) {

            if (item.id == data.item.id) {
                // 暂时修改缓存状态，不调用接口
                item.cached = 1;

                // 下载完成，非下载状态
                item.downloading = false;
            }
        });
  
    });

    // 订阅某个视频缓存失败
    messageCenter.subscribeMessage('cached.failed', function(event, data) {

        _.forEach(ctrl.courseList, function(item) {

            if (item.id == data.item.id) {
                toast.open(item.title + ' 缓存失败');

                // 下载失败，非下载状态
                item.downloading = false;

                _.remove($rootScope.needDownloadList, function(rootItem) {
                    return rootItem.id == item.id;
                });
            }
        });
  
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
