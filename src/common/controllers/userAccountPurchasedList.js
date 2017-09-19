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
