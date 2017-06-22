angular.module('app.controllers').controller('exchangeRecordListCtrl', function(
    $scope, exchangeService, errorHandling, toast, loadDataMixin, stateUtils,
    nativeTransition, $state
) {

    var ctrl = this;

     _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 数据
        loadData: function () {

            ctrl.finishLoading = false;

            return exchangeService.exchangeCodeList()
                .success(function(response) {
                    
                    if (response.list[0]) {
                      ctrl.list = response.list[0];
                    }

                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        },

        // 已兑换过的可进入视频页面
        goVideoList: function(item) {
            var stateName = stateUtils.getStateNameByCurrentTab('videoList');
            nativeTransition.forward();
            $state.go(stateName, {
                exchangeId: item.id,
                from: 'exchangeCode'
            });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
