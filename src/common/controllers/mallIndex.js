angular.module('app.controllers').controller('mallIndexCtrl', function(
    $scope, $state, loadDataMixin, nativeTransition, errorHandling, mallService, loading
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 获取数据
        loadData: function () {
            ctrl.finishLoading = false;
            loading.open();

            ctrl.sliderList = [];
            ctrl.sortList = [];
            ctrl.floorList = [];

            // 获取轮播数据
            return mallService.getMallIndexSlider()
                .success(function(response) {

                    if (!response.list[0]) {
                        return;
                    } else {
                        ctrl.sliderList = response.list[0];
                    }

                    _.forEach(ctrl.sliderList, function(slider) {
                        slider.picUrl = window.APP_CONFIG.serviceAPI + slider.newPicUrl;
                    });

                    // 获取分类信息
                    mallService.getMallIndexSort()
                        .success(function(response) {
                            ctrl.sortList = response.list[0];

                            _.forEach(ctrl.sortList, function(item) {
                                item.imageUrl = window.APP_CONFIG.serviceAPI + item.imageUrl;
                            });
                        })
                        .error(errorHandling);

                    // 获取楼层title
                    mallService.getMallIndexFloorTitle()
                        .success(function(response) {

                            var floorList = [];

                            if (!response.list[0]) {
                                return;
                            } else {
                                floorList = response.list[0];
                            }

                            // 获取楼层data
                            mallService.getMallIndexFloorData()
                                .success(function(response) {

                                    var floorItems = response.list;

                                    _.forEach(floorList, function(floor, index) {

                                        floor.items = floorItems[index];

                                        _.forEach(floorItems[index], function(item) {
                                            item.newPicUrl = window.APP_CONFIG.serviceAPI + item.newPicUrl;
                                        });

                                    });

                                    ctrl.floorList = floorList;

                                })
                                .error(errorHandling)
                                .finally(function() {
                                    ctrl.finishLoading = true;
                                    loading.close();
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