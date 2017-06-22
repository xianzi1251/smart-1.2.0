angular.module('app.controllers').controller('advInfoCtrl', function(
    $scope, $stateParams, loadDataMixin, errorHandling, advService
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        id: $stateParams.id,

        // 是否展示title和日期
        from: $stateParams.from,

        // 获取数据
        loadData: function () {
            ctrl.finishLoading = false;

            // 广告详情
            ctrl.adv = {};

            return advService.getAdvInfo(ctrl.id)
                .success(function(response) {

                    if (!response.list[0][0]) {
                        return;
                    } else {
                        ctrl.adv = response.list[0][0];

                        // 转义返回的文描html
                        ctrl.adv.content = _.unescape(ctrl.adv.content);
                    }

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