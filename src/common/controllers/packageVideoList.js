angular.module('app.controllers').controller('packageVideoListCtrl', function(
    $scope, $state, $stateParams, nativeTransition, errorHandling, commentService, loading, productService,
    toast, loadDataMixin, $ionicScrollDelegate
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
                    $ionicScrollDelegate.$getByHandle('packageVideoListScroll').scrollTop(true);
                    $ionicScrollDelegate.$getByHandle('packageVideoListScroll').resize();
                }
            }
        },

        // 获取套装商品信息
        loadData: function() {
            ctrl.finishLoading = false;
            loading.open();

            ctrl.baseData = [];
            ctrl.courseList = [];
            ctrl.commentsList = [];

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

                                _.forEach(ctrl.courseList, function(item) {
                                    item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
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
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
