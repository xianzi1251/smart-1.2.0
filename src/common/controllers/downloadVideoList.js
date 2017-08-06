angular.module('app.controllers').controller('downloadVideoListCtrl', function(
    $scope, $state, nativeTransition, localStorage, errorHandling, loadDataMixin
) {

    var ctrl = this;

    //     _.assign(ctrl, loadDataMixin, {
    //     $scope: $scope,

    //     // 订单数据
    //     loadData: function () {
    //         ctrl.finishLoading = false;

    //         // 订单结果集
    //         ctrl.videos = [];

    //         var videoList = [],
    //             videoItems = [];

    //         // 获取订单列表数据
    //         return orderService.getOrderList()
    //             .success(function(response) {

    //                 if (!response.list[0]) {
    //                     return;
    //                 } else {
    //                     videoList = response.list[0];
    //                 }

    //                 // 获取订单项数据
    //                 orderService.getOrderItems()
    //                     .success(function(data) {

    //                         if (!data.list[0]) {
    //                             return;
    //                         } else {
    //                             videoItems = data.list[0];
    //                         }

    //                         // 根据id匹配来获取该订单的订单项
    //                         if (videoList && videoItems) {

    //                             _.forEach(videoList, function(order) {
    //                                 var orderId = order.orderId;
    //                                 order.items = [];

    //                                 _.forEach(videoItems, function(item) {
    //                                     var orderItemId = item.orderId;

    //                                     if (orderId == orderItemId) {
    //                                         item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
    //                                         order.items.push(item);
    //                                     }
                                        
    //                                 });
    //                             });

    //                             ctrl.videos = videoList;

    //                         }
    //                     })
    //                     .error(errorHandling)
    //                     .finally(function() {
    //                         ctrl.finishLoading = true;
    //                     });
    //             })
    //             .error(errorHandling);
    //     }

    // });

    // var deregistration = $scope.$on('$ionicView.afterEnter', function() {
    //     // 加载数据
    //     ctrl.init();
    //     deregistration();
    // });

});
