
/**
 * 路由状态配置及相应功能
 */
angular.module('app')
/**
 * 普通路由状态配置
 */
    .constant('states', {
        'tabs': {
            url: '/tabs',
            abstract: true,
            templateUrl: 'templates/tabs.html',
            controller: 'tabsCtrl as tabs'
        },

        'tabs.index': {
            url: '/index',
            views: {
                index: {
                    templateUrl: 'templates/index.html',
                    controller: 'indexCtrl as index'
                }
            }
        },

        'tabs.categoryList': {
            url: '/categoryList?categoryName&categoryTitle',
            views: {
                index: {
                    templateUrl: 'templates/categoryList.html',
                    controller: 'categoryListCtrl as categoryList'
                }
            }
        },

        'tabs.authorList': {
            url: '/authorList',
            views: {
                index: {
                    templateUrl: 'templates/authorList.html',
                    controller: 'authorListCtrl as authorList'
                }
            }
        },

        'tabs.user': {
            url: '/user',
            views: {
                user: {
                    templateUrl: 'templates/user.html',
                    controller: 'userCtrl as user'
                }
            }
        },

        'tabs.exchangeList': {
            url: '/exchangeList',
            views: {
                user: {
                    templateUrl: 'templates/exchangeList.html',
                    controller: 'exchangeListCtrl as exchangeList'
                }
            }
        },

        'tabs.exchangeCode': {
            url: '/exchangeCode',
            views: {
                user: {
                    templateUrl: 'templates/exchangeCode.html',
                    controller: 'exchangeCodeCtrl as exchangeCode'
                }
            }
        },

        'tabs.exchangeRecordList': {
            url: '/exchangeRecordList',
            views: {
                user: {
                    templateUrl: 'templates/exchangeRecordList.html',
                    controller: 'exchangeRecordListCtrl as exchangeRecordList'
                }
            }
        },

        'tabs.exchangeRule': {
            url: '/exchangeRule',
            views: {
                user: {
                    templateUrl: 'templates/exchangeRule.html'
                }
            }
        },

        'tabs.feedback': {
            url: '/feedback',
            views: {
                user: {
                    templateUrl: 'templates/feedback.html',
                    controller: 'feedbackCtrl as feedback'
                }
            }
        },

        'tabs.aboutUs': {
            url: '/aboutUs',
            views: {
                user: {
                    templateUrl: 'templates/aboutUs.html',
                    controller: 'aboutUsCtrl as aboutUs'
                }
            }
        },

        'tabs.version': {
            url: '/version',
            views: {
                user: {
                    templateUrl: 'templates/version.html',
                    controller: 'versionCtrl as version'
                }
            }
        },

        'tabs.modifyPwd': {
            url: '/modifyPwd',
            cache: false,
            views: {
                user: {
                    templateUrl: 'templates/modifyPwd.html',
                    controller: 'modifyPwdCtrl as modifyPwd'
                }
            }
        },

        'tabs.userAccountSetting': {
            url: '/userAccountSetting?nickName&personInfo&mobile',
            views: {
                user: {
                    templateUrl: 'templates/userAccountSetting.html',
                    controller: 'userAccountSettingCtrl as setting'
                }
            }
        },

        'tabs.authentication': {
            url: '/authentication',
            views: {
                user: {
                    templateUrl: 'templates/authentication.html'
                }
            }
        },

        'tabs.orderList': {
            url: '/orderList',
            views: {
                user: {
                    templateUrl: 'templates/orderList.html',
                    controller: 'orderListCtrl as orderList'
                }
            }
        },

        'tabs.downloadVideoList': {
            url: '/downloadVideoList',
            views: {
                user: {
                    templateUrl: 'templates/downloadVideoList.html',
                    controller: 'downloadVideoListCtrl as downloadVideoList'
                }
            }
        },

        'tabs.viewVideoList': {
            url: '/viewVideoList',
            views: {
                user: {
                    templateUrl: 'templates/viewVideoList.html',
                    controller: 'viewVideoListCtrl as viewVideoList'
                }
            }
        },

        'tabs.couponList': {
            url: '/couponList',
            views: {
                user: {
                    templateUrl: 'templates/couponList.html',
                    controller: 'couponListCtrl as couponList'
                }
            }
        },

        // 'tabs.shoppingCart': {
        //     url: '/shoppingCart',
        //     views: {
        //         cart: {
        //             templateUrl: 'templates/shoppingCart.html',
        //             controller: 'shoppingCartCtrl as cart'
        //         }
        //     }
        // },

        'tabs.purchasedList': {
            url: '/purchasedList',
            views: {
                purchased: {
                    templateUrl: 'templates/purchasedList.html',
                    controller: 'purchasedListCtrl as purchased'
                }
            }
        },

        'tabs.sliderList': {
            url: '/sliderList',
            cache: false,
            views: {
                sliderList: {
                    templateUrl: 'templates/sliderList.html',
                    controller: 'sliderListCtrl as sliderList'
                }
            }
        },

        'tabs.mallIndex': {
            url: '/mallIndex',
            views: {
                mall: {
                    templateUrl: 'templates/mall/mallIndex.html',
                    controller: 'mallIndexCtrl as mallIndex'
                }
            }
        },

        'tabs.mallSortList': {
            url: '/mallSortList?categoryName',
            views: {
                mall: {
                    templateUrl: 'templates/mall/mallSortList.html',
                    controller: 'mallSortListCtrl as mallSortList'
                }
            }
        },

        'tabs.mallSearchList': {
            url: '/mallSearchList',
            views: {
                mall: {
                    templateUrl: 'templates/mall/mallSearchList.html',
                    controller: 'mallSearchListCtrl as mallSearchList'
                }
            }
        }
 
    })

/**
 * 在每一个 tab 项下都要提供的状态配置
 *
 * 其中 state 名称 及 url 的格式比较特殊，比如商品列表视图配置为如下 state 名称：
 *
 *   productList
 *
 * 在注册时会自动为其添加前缀：
 *
 *    tabs.indexProductList
 *    tabs.cartProductList
 *
 * url 亦同。
 *
 * 另外不支持设置 views 属性。
 */
    .constant('statesForEveryTab', {

        'productInfo': {
            url: '/productInfo?entityName&genreName',
            templateUrl: 'templates/productInfo.html',
            controller: 'productInfoCtrl as productInfo'
        },

        // 首页平台导师的详情页，有可试读部分
        'teacherInfo': {
            url: '/teacherInfo?entityName',
            templateUrl: 'templates/teacherInfo.html',
            controller: 'teacherInfoCtrl as info'
        },

        // 试读列表页
        'freeList': {
            url: '/freeList?entityName',
            templateUrl: 'templates/freeList.html',
            controller: 'freeListCtrl as freeList'
        },

        // 试读详情页
        'freeInfo': {
            url: '/freeInfo?entityName&genreName&videoUrl',
            templateUrl: 'templates/freeInfo.html',
            controller: 'freeInfoCtrl as freeInfo'
        },

        'orderInfo': {
            url: '/orderInfo?orderId',
            templateUrl: 'templates/orderInfo.html',
            controller: 'orderInfoCtrl as orderInfo'
        },

        'comment': {
            url: '/comment?id&skuId&title&source',
            templateUrl: 'templates/comment.html',
            controller: 'commentCtrl as comment'
        },

        'shoppingCart': {
            url: '/shoppingCart',
            templateUrl: 'templates/shoppingCart.html',
            controller: 'shoppingCartCtrl as cart'
        },

        // 积分兑换／兑换码中的视频列表
        'exchangeVideoList': {
            url: '/exchangeVideoList?exchangeId&from',
            templateUrl: 'templates/exchangeVideoList.html',
            controller: 'exchangeVideoListCtrl as videoList'
        },

        // 积分兑换／兑换码中的视频详情
        'videoInfo': {
            url: '/videoInfo?entityName&videoUrl&genreName',
            templateUrl: 'templates/videoInfo.html',
            controller: 'videoInfoCtrl as videoInfo'
        },

        'advList': {
            url: '/advList?positionName&title',
            templateUrl: 'templates/advList.html',
            controller: 'advListCtrl as advList'
        },

        'advInfo': {
            url: '/advInfo?id&from',
            templateUrl: 'templates/advInfo.html',
            controller: 'advInfoCtrl as advInfo'
        },
        
        'eBookInfo': {
            url: '/eBookInfo?id&from',
            templateUrl: 'templates/eBookInfo.html',
            controller: 'advInfoCtrl as advInfo'
        },

        'userConsigneeList': {
            url: '/userConsigneeList',
            templateUrl: 'templates/userConsigneeList.html',
            controller: 'userConsigneeListCtrl as userConsigneeList'
        },

        'mallProductInfo': {
            url: '/mallProductInfo?entityName',
            templateUrl: 'templates/mall/mallProductInfo.html',
            controller: 'mallProductInfoCtrl as mallProductInfo'
        },

        // 已购列表页虚拟－单个／套餐视频页面
        'courseVideo': {
            url: '/courseVideo?entityName',
            templateUrl: 'templates/courseVideo.html',
            controller: 'courseVideoCtrl as video'
        },

        // 已购列表页虚拟－套餐音频页面
        'courseAudio': {
            url: '/courseAudio?entityName',
            templateUrl: 'templates/courseAudio.html',
            controller: 'courseAudioCtrl as audio'
        }

    });
