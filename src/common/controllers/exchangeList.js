angular.module('app.controllers').controller('exchangeListCtrl', function(
    $scope, toast, popup, loadDataMixin, exchangeService, errorHandling, messageCenter,
    userService, modals, stateUtils, nativeTransition, $state
) {

    var ctrl = this;

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 获取数据
        loadData: function() {

            ctrl.finishLoading = false;

            return exchangeService.getExchangeList()
                .success(function(response) {
                    ctrl.list = response.list[0];

                    ctrl.amount = response.object.loyalty;
                })
                .error(errorHandling)
                .finally(function() {
                    ctrl.finishLoading = true;
                });
        },

        // 兑换
        exchange: function (item) {

            userService.hasLogined()
                .success(function() {

                    popup.confirm('积分兑换', '请确认购买：' + item.refName)
                        .then(function(res) {
                            if (res) {
                                exchangeService.exchange(item.id)
                                    .success(function() {
                                        toast.open('兑换成功');
                                    })
                                    .error(errorHandling)
                            }
                        });

                })
                .error(function() {
                    modals.login.open();
                });        

        },

        // 已兑换过的可进入视频页面
        goExchangeVideoList: function(item) {
            if (!item.exchanged) return;
            
            var stateName = stateUtils.getStateNameByCurrentTab('exchangeVideoList');
            nativeTransition.forward();
            $state.go(stateName, {
                exchangeId: item.id,
                from: 'exchange'
            });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        // 加载数据
        ctrl.init();
        deregistration();
    });

    // 订阅提交[积分兑换成功]消息 刷新列表
    messageCenter.subscribeMessage('exchange.success', function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});
