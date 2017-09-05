angular.module('app.controllers').controller('startEventCtrl',function(
    modals, $state, userService, messageCenter, stateUtils, nativeTransition
) {

    var ctrl = this;

    _.assign(ctrl, {

        // 关闭弹层
        closeModal: function($event) {
            if ($event) $event.stopPropagation();
            modals.startEvent.close();
        },

        // 查看我的优惠券
        goCouponList: function() {

            // 关闭弹层
            modals.startEvent.close();

            userService.hasLogined()
                .success(function() {

                    setTimeout(function () {
                        var stateName = stateUtils.getStateNameByCurrentTab('couponList');
                        nativeTransition.forward();
                        $state.go(stateName);
                    });

                })
                .error(function() {

                    modals.login.open()
                        .then(function(e) {
                            messageCenter.subscribeMessage(['login', 'wechatLogin'], function() {
                                setTimeout(function () {
                                    var stateName = stateUtils.getStateNameByCurrentTab('couponList');
                                    nativeTransition.forward();
                                    $state.go(stateName);
                                });
                            }, e.scope);
                        });

                });
            
        }
    });

});
