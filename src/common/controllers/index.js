angular.module('app.controllers').controller('indexCtrl', function(
    $scope, $stateParams, $state, stateUtils, nativeTransition, indexService, 
    errorHandling, localStorage, loading
) {

    var ctrl = this;

    var positionName = {
        slider: '1479108028003',
        recommend: '1482333476320',
        author: '1482333642009',
        suit: '1494125330508',
        buttomAdv: '1482796079692'
    };

    // 分类
    var category = [
        {
            categoryName: '1482302298292',
            categoryTitle: '时政大家谈'
        },
        {
            categoryName: '1482302568836',
            categoryTitle: '公考培训'
        },
        {
            categoryName: '1482302767093',
            categoryTitle: '军转培训'
        },
        {
            categoryName: '1482302920323',
            categoryTitle: '在职培训'
        },
    ];

    _.assign(ctrl, {
        $scope: $scope,

        // 跳转商品详情
        goProductInfo: stateUtils.goProductInfo,

        // 跳转广告列表
        goAdvList: stateUtils.goAdvList,

        // 跳转广告详情页
        goAdvInfo: stateUtils.goAdvInfo,

        // 跳转套餐详情页
        goTeacherInfo: stateUtils.goTeacherInfo,

        // 跳转商城－商品详情
        goMallProductInfo: stateUtils.goMallProductInfo,

        // 轮播图跳转
        goSliderAdv: function(item) {
            var type = item.advType;

            if (type == 'html') {
                // 跳转到广告详情页
                ctrl.goAdvInfo(item.id);

            } else if (type == 'entity') {
                // 跳转至图书详情页
                ctrl.goMallProductInfo(item.entityName);
                
            } else if (type == 'link' && item.linkUrl.indexOf('http') != -1) {
                // 跳转至外部连接
                if (window.cordova && window.cordova.InAppBrowser) {
                    window.cordova.InAppBrowser.open(item.linkUrl, '_system');
                } else {
                    window.open(item.linkUrl);
                }
            }
        },

        // 跳转分类
        goCategoryList: function($index) {

            nativeTransition.forward();
            $state.go('tabs.categoryList', {
                categoryName: category[$index].categoryName,
                categoryTitle: category[$index].categoryTitle
            });
        },

        // 初始化首页数据
        init: function() {
            ctrl.getSliderList();
            ctrl.getRecommendList();
            ctrl.getAuthorList();
            ctrl.getTeacherList();
            ctrl.getSupportWechat();

            $scope.$broadcast('scroll.refreshComplete');
        },

        // 轮播图数据
        getSliderList: function() {

            indexService.getIndexInfo(positionName.slider)
                .success(function(response) {
                    ctrl.sliderList = response.list[0];

                    _.forEach(ctrl.sliderList, function(slider) {
                        slider.picUrl = window.APP_CONFIG.serviceAPI + slider.newPicUrl;
                    });
                })
                .error(errorHandling);
        },

        // 精品推荐数据
        getRecommendList: function() {

            indexService.getIndexInfo(positionName.recommend)
                .success(function(response) {
                    ctrl.recommendList = response.list[0];

                    _.forEach(ctrl.recommendList, function(recommend) {
                        recommend.picUrl = window.APP_CONFIG.serviceAPI + recommend.picUrl;
                    });
                })
                .error(errorHandling);
        },

        // 套餐推荐数据
        getTeacherList: function() {

            indexService.getIndexInfo(positionName.suit)
                        .success(function(response) {
                            ctrl.teacherList = response.list[0];

                            _.forEach(ctrl.teacherList, function(suit) {
                                suit.picUrl = window.APP_CONFIG.serviceAPI + suit.picUrl;
                            });
                        })
                        .error(errorHandling);
        },

        // 平台导师数据
        getAuthorList: function() {

            indexService.getIndexInfo(positionName.author)
                .success(function(response) {
                    ctrl.authorList = response.list[0];

                    _.forEach(ctrl.authorList, function(author) {
                        author.picUrl = window.APP_CONFIG.serviceAPI + author.newPicUrl;
                    });
                })
                .error(errorHandling);
        },

        // 底部广告位
        // getBottomAdv: function() {

        //     indexService.getIndexInfo(positionName.buttomAdv)
        //         .success(function(response) {
        //             ctrl.bottomAdvList = response.list[0];

        //             _.forEach(ctrl.bottomAdvList, function(adv) {
        //                 adv.picUrl = window.APP_CONFIG.serviceAPI + adv.newPicUrl;
        //             });
        //         })
        //         .error(errorHandling);
        // },

        // 判断是否支持微信
        getSupportWechat: function() {
            if (window.wechatPay) {
                window.wechatPay.checkAppInstalled(function(res) {
                    if (res === 'true') {
                        localStorage.set('supportWechat', true);
                    }
                }, function(error) {
                    alert('checkAppInstalled error' + res);
                    localStorage.set('supportWechat', false);
                });
            } else {
                localStorage.set('supportWechat', false);
            }
        },

        // 查看更多专栏作家
        goAuthorList: function() {
            // 专栏作家列表视图
            nativeTransition.forward();
            $state.go('tabs.authorList');
        },

        // 去商城首页
        goMallIndex: function() {
            nativeTransition.forward();
            $state.go('tabs.mallIndex');
        }
    });

    ctrl.init();

});
