angular.module('app.controllers').controller('suitInfoCtrl', function(
    $scope, $state, nativeTransition, errorHandling, stateUtils, loadDataMixin, $stateParams,
    productService, toast, errorHandling, userService, modals, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        tabAction: 0,

        // tab内容
        infoTabs: [
            {
                label: '作者介绍',
                active: true
            },
            {
                label: '相关课程',
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
                }
            }
        },

        entityName: $stateParams.entityName,

        // 默认可卖
        sellAbled: true,

        // 跳转商品详情
        goProductInfo: stateUtils.goProductInfo,

        // 获取套装商品信息
        loadData: function() {
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
                                ctrl.suitCourseList = response.list[0];
                                _.forEach(ctrl.suitCourseList, function(item) {
                                    item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                                });
                            }
                        })
                        .error(errorHandling);

                })
                .error(errorHandling);
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

        // 去试听列表页
        goFreeList: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('freeList');
            nativeTransition.forward();
            $state.go(stateName, {
                entityName: ctrl.entityName
            });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

});
