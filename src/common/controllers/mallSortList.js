angular.module('app.controllers').controller('mallSortListCtrl', function(
    $scope, $state, $stateParams, errorHandling, loadDataMixin, mallService, loading, nativeTransition,
    stateUtils, userService, cartService, toast, modals, messageCenter
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 默认的搜索关键字
        keyword: '',

        // 分类
        categoryName: $stateParams.categoryName,
        categoryLabel: '',

        // 排序
        sortName: 'weight desc',
        sortLabel: '排序',

        // 价格默认排序
        priceSortType: '',

        // 默认不显示弹层
        showModal: false,

        // 排序内容
        sortItemsStatic: [
            {
                label: '不限',
                sortName: 'weight desc',
                selected: false
            },
            {
                label: '评论最多',
                sortName: 'commentNums desc',
                selected: false
            },
            {
                label: '最新发布',
                sortName: 'publishDate desc',
                selected: false
            },
            {
                label: '销量最高',
                sortName: 'salesVolume desc',
                selected: false
            }
        ],

        // 跳转商品详情
        goMallProductInfo: stateUtils.goMallProductInfo,

        // 去购物车
        goShoppingCart: function() {

            userService.hasLogined()
                .success(function() {

                    var stateName = stateUtils.getStateNameByCurrentTab('shoppingCart');
                    nativeTransition.forward();
                    $state.go(stateName);

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

        // 添加购物车
        addToCart: function (item, $event) {

            $event.stopPropagation();

            userService.hasLogined()
                .success(function() {

                    cartService.addToCart(item.sku)
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

        // 获取数据
        init: function () {
            ctrl.finishLoading = false;
            loading.open();
            ctrl.sortItems = [];

            var sort = _.trim(ctrl.priceSortType + ' ' + ctrl.sortName);

            // 获取全部分类
            var pageLimit = 1000;
            mallService.getMallSort(pageLimit)
                .success(function(response) {
                    ctrl.sortItems = response.list[0];

                    ctrl.sortItems.unshift({
                        label: '全部',
                        categoryName: 'book'
                    });

                    _.forEach(ctrl.sortItems, function(item) {
                        item.selected = false;
                        if (item.categoryName == ctrl.categoryName) {
                            ctrl.categoryLabel = item.label;
                        }
                    });

                    mallService.getMallProductList(ctrl.keyword, ctrl.categoryName, sort)
                        .success(function(response) {
                            ctrl.productList = response.results.list;

                            _.forEach(ctrl.productList, function(item) {
                                item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                            });
                            
                        })
                        .error(errorHandling)
                        .finally(function() {
                            loading.close();
                            ctrl.finishLoading = true;
                        });
                })
                .error(errorHandling);
        },

        // 价格排序
        togglePrice: function() {

            ctrl.showModal = false;

            ctrl.activeSortItem1 = false;
            ctrl.activeSortItem2 = false;

            if (ctrl.priceSortType == '') {
                ctrl.priceSortType = 'skuOfferPrice asc';

                ctrl.activePriceItem = true;

            } else if (ctrl.priceSortType == 'skuOfferPrice asc') {
                ctrl.priceSortType = 'skuOfferPrice desc';

                ctrl.activePriceItem = true;

            } else if (ctrl.priceSortType == 'skuOfferPrice desc') {
                ctrl.priceSortType = '';

                ctrl.activePriceItem = false;
            }

            ctrl.init();
        },

        // 显示全部分类弹层
        showSortModalFun1: function() {

            if (ctrl.showSortModal1) {
                ctrl.closeSortModal1();
            } else if (ctrl.showSortModal2) {
                ctrl.closeSortModal2();
                ctrl.openSortModal1();
            } else {
                ctrl.openSortModal1();
            }
        },

        // 显示排序弹层
        showSortModalFun2: function() {

            if (ctrl.showSortModal1) {
                ctrl.closeSortModal1();
                ctrl.openSortModal2();
            } else if (ctrl.showSortModal2) {
                ctrl.closeSortModal2();
            } else {
                ctrl.openSortModal2();
            }
        },

        // 打开分类弹层
        openSortModal1: function() {
            ctrl.showModal = true;

            ctrl.activeSortItem1 = true;
            ctrl.activeSortItem2 = false;

            ctrl.showSortModal1 = true;
            ctrl.showSortModal2 = false;

            _.forEach(ctrl.sortItems, function(item) {
                if (item.categoryName == ctrl.categoryName) {
                    item.selected = true;
                }
            });
        },

        // 关闭分类弹层
        closeSortModal1: function() {
            ctrl.showModal = false;

            ctrl.activeSortItem1 = false;
            ctrl.activeSortItem2 = false;

            ctrl.showSortModal1 = false;
            ctrl.showSortModal2 = false;
        },

        // 打开分类弹层
        openSortModal2: function() {
            ctrl.showModal = true;

            ctrl.activeSortItem1 = false;
            ctrl.activeSortItem2 = true;

            ctrl.showSortModal1 = false;
            ctrl.showSortModal2 = true;

            _.forEach(ctrl.sortItemsStatic, function(item) {
                if (item.sortName == ctrl.sortName) {
                    item.selected = true;
                }
            });
        },

        // 关闭分类弹层
        closeSortModal2: function() {
            ctrl.showModal = false;

            ctrl.activeSortItem1 = false;
            ctrl.activeSortItem2 = false;

            ctrl.showSortModal1 = false;
            ctrl.showSortModal2 = false;
        },

        // 修改分类条件
        changeSort1: function(item) {

            ctrl.showModal = false;
            ctrl.activeSortItem1 = false;
            ctrl.showSortModal1 = false;

            _.forEach(ctrl.sortItems, function(item) {
                item.selected = false;
            });

            if (ctrl.categoryName != item.categoryName) {

                item.selected = true;

                ctrl.categoryLabel = item.label;
                ctrl.categoryName = item.categoryName;

                ctrl.init();
            }
        },

        // 修改排序条件
        changeSort2: function(item) {

            ctrl.showModal = false;
            ctrl.activeSortItem2 = false;
            ctrl.showSortModal2 = false;

            _.forEach(ctrl.sortItemsStatic, function(item) {
                item.selected = false;
            });

            if (ctrl.sortName != item.sortName) {

                item.selected = true;

                ctrl.sortLabel = item.label;
                ctrl.sortName = item.sortName;

                ctrl.init();
            }
        },

        // 隐藏遮罩层
        hideMask: function() {

            ctrl.showModal = false;

            ctrl.showSortModal1 = false;
            ctrl.activeSortItem1 = false;

            ctrl.showSortModal2 = false;
            ctrl.activeSortItem2 = false;
        }

    });

    // 页面进入时重置搜索关键字
    $scope.$on('$ionicView.beforeEnter', function() {
        ctrl.priceSortType = '';

        ctrl.sortName = 'weight desc';
        ctrl.sortLabel = '排序';
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
