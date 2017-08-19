angular.module('app.controllers').controller('purchasedListCtrl', function(
    $scope, $state, orderService, loadDataMixin, stateUtils, messageCenter, $ionicScrollDelegate, 
    nativeTransition, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 跳转视频详情
        goVideoInfo: stateUtils.goVideoInfo,

        // tab内容
        tabText: ['课程', '图书'],

        // 默认显示的tab
        type: 'course',

        // 切换tab
        onSwitchType: function(type) {
            if (ctrl.type != type) {
                ctrl.type = type;
                $ionicScrollDelegate.$getByHandle('purchasedListScroll').scrollTop(true);
            }
        },

        // 获取数据
        loadData: function () {
            ctrl.finishLoading = false;
            ctrl.courses = [];
            ctrl.books = [];

            // 获取课程数据，课程为单个的课程信息［可能视频套餐／视频单品／音频套餐］
            return orderService.getPurchasedCourseList()
                .success(function(data) {

                    if (!data.list[0]) {
                        return;
                    } else {
                        ctrl.courses = data.list[0];
                    }

                    _.forEach(ctrl.courses, function(item) {
                        item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                    });

                    // 获取图书数据，此处类似订单列表页，一个订单可能会有多个图书信息
                    orderService.getOrderList('finish')
                        .success(function(response) {

                            // 结果集
                            var orderList = [],
                                orderItems = [];

                            if (!response.list[0]) {
                                return;
                            } else {
                                orderList = response.list[0];
                            }

                            // 获取图书集合
                            orderService.getPurchasedBookList()
                                .success(function(data) {

                                    if (!data.list[0]) {
                                        return;
                                    } else {
                                        orderItems = data.list[0];
                                    }

                                    // 根据id匹配来获取该订单的订单项
                                    if (orderList && orderItems) {

                                        _.forEach(orderList, function(order) {
                                            var orderId = order.orderId;
                                            order.books = [];

                                            _.forEach(orderItems, function(item) {
                                                var orderItemId = item.orderId;

                                                if (orderId == orderItemId) {
                                                    item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                                                    order.books.push(item);
                                                }
                                                
                                            });

                                            // 如无图书信息，则不显示
                                            if (order.books.length > 0) {
                                                ctrl.books.push(order);
                                            }
                                        });
                                    }
                                })
                                .error(errorHandling)
                                .finally(function() {
                                    ctrl.finishLoading = true;
                                });
                        })
                        .error(errorHandling);
                })
                .error(errorHandling);
        },

        // 点评
        goComment: function(item, $event) {
            $event.stopPropagation();
            var stateName = stateUtils.getStateNameByCurrentTab('comment');
            nativeTransition.forward();
            $state.go(stateName, {
                id: item.id,
                skuId: item.skuId,
                title: item.title,
                source: 'tabs.purchasedList'
            });
        },

        // 查看订单详情
        goOrderInfo: function(orderId) {
            var stateName = stateUtils.getStateNameByCurrentTab('orderInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                orderId: orderId
            });
        },

        // 虚拟商品跳转［单个音频／单个视频／套餐视频］
        goPurchasedInfo: function(item) {
            var genreName = item.genreName,
                taocan = item.taocan,
                cdtName = item.cdtName;

            if (genreName == 'radio' && taocan == 0) {

                // 单个音频
                ctrl.goVideoInfo(cdtName, item.videoUrl, item.isExpiry, genreName);

            } else if (genreName == 'video') {

                // 单个视频／套餐视频
                var stateName = stateUtils.getStateNameByCurrentTab('packageVideoList');
                nativeTransition.forward();
                $state.go(stateName, {
                    entityName: cdtName
                });
            }
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

    // 订阅提交[支付订单成功/登录/评论商品成功]消息 刷新列表
    messageCenter.subscribeMessage(['pay.success', 'login', 'order.comment'], function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});
