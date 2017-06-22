angular.module('app.controllers').controller('authorListCtrl', function(
    $scope, indexService, errorHandling, loadDataMixin, stateUtils
) {

    var ctrl = this;

    var positionName = {
        author: '1482333642009',
        suit: '1494125330508'
    };

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 跳转广告详情页
        goAdvInfo: stateUtils.goAdvInfo,

        // 跳转套餐详情页
        goSuitInfo: stateUtils.goSuitInfo,

        // 初始化专栏作家数据
        loadData: function() {

            return indexService.getIndexInfo(positionName.author)
                .success(function(response) {
                    ctrl.authorList = response.list[0];

                    _.forEach(ctrl.authorList, function(author) {
                        author.picUrl = window.APP_CONFIG.serviceAPI + author.newPicUrl;
                    });

                    indexService.getIndexInfo(positionName.suit)
                        .success(function(response) {
                            ctrl.suitList = response.list[0];

                            _.forEach(ctrl.suitList, function(suit) {
                                suit.picUrl = window.APP_CONFIG.serviceAPI + suit.picUrl;
                            });
                        })
                        .error(errorHandling);
                })
                .error(errorHandling);
        }
    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

});
