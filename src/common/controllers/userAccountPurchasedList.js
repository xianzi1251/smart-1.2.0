angular.module('app.controllers').controller('userAccountPurchasedListCtrl', function(
    $scope, loadDataMixin, userAccountService, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 加载数据
        loadData: function() {
            ctrl.finishLoading = false;

            ctrl.list = [];

            return userAccountService.getAccountHistory()
                .success(function(response) {
                    ctrl.list = response.list[0];

                    _.forEach(ctrl.list, function(item) {

                        // 如果价格为负数／描述强制换行，则需要特殊处理
                        item.symbol = '';
                        if (item.transactionAmount < 0) {

                            // 价格为负数
                            item.symbol = '-';
                            item.transactionAmount = Math.abs(item.transactionAmount);

                            // 遇到冒号就换行
                            item.detail =  _.unescape(item.detail).replace(/:/g, ':<br />');
                        }
                    });
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
