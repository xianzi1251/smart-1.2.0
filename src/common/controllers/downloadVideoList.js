angular.module('app.controllers').controller('downloadVideoListCtrl', function(
    $scope, $state, nativeTransition, localStorage, errorHandling, loadDataMixin, videoService,
    loading, $ionicScrollDelegate, toast, $rootScope, stateUtils
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        /**
         * 操作模式：
         * 1. 删除
         * 2. 取消
         */
        mode: 1,

        // 订单数据
        loadData: function () {
            loading.open();
            ctrl.finishLoading = false;

            ctrl.mode = 1;

            // 获取订单列表数据
            return videoService.getDownloadVideoList()
                .success(function(response) {
                    ctrl.list = response.list[0];

                    _.forEach(ctrl.list, function(item) {
                        item.selected = false;
                    });
   
                })
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                    ctrl.finishLoading = true;
                });
        },

        // 去详情页
        goVideoInfo: function(item) {

            // 如果当前处于编辑状态，则不能跳转
            if (ctrl.mode == 2) {
                
                // 当前选中方式取反
                item.selected = !item.selected;

                // 当前选中的数量
                var active = 0;

                _.forEach(ctrl.list, function(item) {
                    if (item.selected) {
                        active++;
                    }
                });

                if (active == ctrl.list.length) {
                    ctrl.selectedText = '取消全选';
                } else {
                    ctrl.selectedText = '全选';
                }

            } else {

                // 本地视频播放
                stateUtils.goVideoInfo(item.commodityName, item.videoPath, false, 'video');
                
            }
        },

        // 切换编辑功能
        toggleEditMode: function() {

            if (ctrl.mode !== 2) {
                ctrl.mode = 2;

                // 在进入编辑模式时，进行必要的初始化操作，未选中状态
                _.forEach(ctrl.list, function(item) {
                    item.selected = false;
                });

                ctrl.selectedText = '全选';
            }
            else {
                ctrl.mode = 1;

                $ionicScrollDelegate.$getByHandle('downloadVideoListScroll').scrollTop(true);
            }
        },

        // 全选/取消全选
        selectAll: function() {

            // 当前选中的数量
            var active = 0;

            _.forEach(ctrl.list, function(item) {
                if (item.selected) {
                    active++;
                }
            });

            if (active == ctrl.list.length) {
                _.forEach(ctrl.list, function(item) {
                    item.selected = false;
                });
                ctrl.selectedText = '全选';
            } else {
                _.forEach(ctrl.list, function(item) {
                    item.selected = true;
                });
                ctrl.selectedText = '取消全选';
            }
        },

        // 删除
        deleteVideo: function() {

            // 需要删除本地视频文件名称
            var fileNames = [];

            // 记录所有已选中的视频
            var cacheIds = '';

            _.forEach(ctrl.list, function(item) {
                if (item.selected) {
                    cacheIds += item.id + ',';
                    fileNames.push(item.commodityTitle + item.commodityName + '.mp4');
                }
            });

            // 删除操作
            if (cacheIds == '') {
                toast.open('请选择需要删除的内容');
            } else {
                loading.open();
                videoService.deleteDownloadVideo(cacheIds)
                    .success(function() {
                        // 删除本地缓存视频
                        $rootScope.deleteCachedAttachment(fileNames);

                        // 删除数据库中的视频
                        toast.open('删除成功');
                        ctrl.refresh();
                    })
                    .error(errorHandling)
                    .finally(function() {
                        loading.close();
                    });
            }
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
