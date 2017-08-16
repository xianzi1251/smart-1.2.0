angular.module('app.controllers').controller('advListCtrl', function(
    $scope, $stateParams, loadDataMixin, errorHandling, advService, stateUtils
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        positionName: $stateParams.positionName,

        title: $stateParams.title || '专题',

        // 跳转广告详情页
        goAdvInfo: stateUtils.goAdvInfo,

        // 打开pdf文件
        goEBookInfo: function(item) {
            if (window.cordova && window.cordova.InAppBrowser) {
                window.cordova.InAppBrowser.open(item.pdfUrl, '_system');
            } else {
                window.open(item.pdfUrl);
            }
        },

        // 获取列表数据
        loadData: function () {
            ctrl.finishLoading = false;

            // 订单结果集
            ctrl.advList = [];

            var orderList = [];

            return advService.getAdvList(ctrl.positionName)
                .success(function(response) {

                    if (!response.list[0]) {
                        return;
                    } else {
                        orderList = response.list[0];
                    }

                    _.forEach(orderList, function(item) {
                        item.picUrl = window.APP_CONFIG.serviceAPI + item.picUrl;
                        item.pdfUrl = window.APP_CONFIG.serviceAPI + item.pdfUrl;
                    });

                    ctrl.advList = orderList;

                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});