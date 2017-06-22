angular.module('app.controllers').controller('videoListCtrl', function(
    $scope, exchangeService, loadDataMixin, stateUtils, $stateParams, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 跳转视频详情
        goVideoInfo: stateUtils.goVideoInfo,

        exchangeId: $stateParams.exchangeId,

        // 积分兑换视频列表／兑换码视频列表
        from: $stateParams.from,

        // 获取数据
        loadData: function () {

            ctrl.finishLoading = false;

            // 结果集
            ctrl.items = [];

            var orderItems = [];

            if (ctrl.from == 'exchange') {

                // 获取积分兑换视频列表数据
                return exchangeService.getExchangeVideoList(ctrl.exchangeId)
                    .success(function(data) {

                        if (data.list && data.list[0]) {
                            orderItems = data.list[0];

                            _.forEach(orderItems, function(item) {
                                item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                            });

                            ctrl.items = orderItems;
                        }
                    })
                    .error(errorHandling)
                    .finally(function() {
                        ctrl.finishLoading = true;
                    });
            } else if (ctrl.from == 'exchangeCode') {

                // 获取兑换码视频列表数据
                return exchangeService.getExchangeCodeVideoList(ctrl.exchangeId)
                    .success(function(data) {

                        if (data.list && data.list[0]) {
                            orderItems = data.list[0];

                            _.forEach(orderItems, function(item) {
                                item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                            });

                            ctrl.items = orderItems;
                        }
                    })
                    .error(errorHandling)
                    .finally(function() {
                        ctrl.finishLoading = true;
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
