angular.module('app.controllers').controller('userCtrl', function(
    $scope, api, toast, nativeTransition, $state, stateUtils, modals, userService, 
    errorHandling, $ionicScrollDelegate, localStorage
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        nickName: '',

        personInfo: '',

        mobile: '',

        init: function() {
            ctrl.data = {};

            // 如当前为第三方登录，则隐藏 ‘修改密码’ 条目
            ctrl.thirdPartylogin = localStorage.get('user').thirdPartylogin;

            // 当前是否开启兑换／积分／收货地址[1: 关闭, 0: 开启]
            ctrl.bytSwitch = localStorage.get('user').bytSwitch;

            userService.info()
                .success(function(data) {
                    ctrl.data = data;
                    var baseData = data.list[0][0];
                    if (baseData) {
                        ctrl.nickName = baseData.nickName;
                        ctrl.personInfo = baseData.personInfo;
                        ctrl.picUrl = baseData.imagePath;
                        ctrl.mobile = baseData.isMobileBind ? baseData.displayName : '';
                    }
                    
                    ctrl.countAmount = data.object.itemNums;
                    ctrl.countCoupon = data.object.cpnCodeNums;
                    ctrl.loyalty = data.object.loyalty;
                })
                .error(errorHandling)
                .finally(function() {
                    // 停止广播ion-refresher
                    $scope.$broadcast('scroll.refreshComplete');
                });
        },

        // 账号设置
        goUserAccountSetting: function() {
            nativeTransition.forward();
            $state.go('tabs.userAccountSetting', {
                nickName: ctrl.nickName,
                personInfo: ctrl.personInfo,
                mobile: ctrl.mobile
            });
        },

        // 购物车
        goShoppingCart: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('shoppingCart');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 我的订单
        goOrderList: function() {
            nativeTransition.forward();
            $state.go('tabs.orderList');
        },

        // 优惠券
        goCouponList: function() {
            nativeTransition.forward();
            $state.go('tabs.couponList');
        },

        // 军人认证
        goAuthentication: function() {
            nativeTransition.forward();
            $state.go('tabs.authentication');
        },

        // 积分兑换
        goExchangeList: function() {
        	nativeTransition.forward();
            $state.go('tabs.exchangeList');
        },

        // 兑换码
        goExchangeCode: function() {
        	nativeTransition.forward();
            $state.go('tabs.exchangeCode');
        },

        // 离线中心
        goDownloadVideoList: function() {
            nativeTransition.forward();
            $state.go('tabs.downloadVideoList');
        },

        // 观看记录
        goViewVideoList: function() {
            nativeTransition.forward();
            $state.go('tabs.viewVideoList');
        },

        // 收货地址
        goConsigneeList: function() {
            var stateName = stateUtils.getStateNameByCurrentTab('userConsigneeList');
            nativeTransition.forward();
            $state.go(stateName);
        },

        // 修改密码
        goModifyPwd: function() {
            nativeTransition.forward();
            $state.go('tabs.modifyPwd');
        },

        // 意见反馈
        goFeedback: function() {
            nativeTransition.forward();
            $state.go('tabs.feedback');
        },

        // 版本信息
        goAboutUs: function() {
            nativeTransition.forward();
            $state.go('tabs.aboutUs');
        },

        // 退出
        logout: function () {
            userService.logout()
                .finally(function() {
                    $state.go('tabs.index');
                });
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();

        $scope.$on('$ionicView.afterEnter',function() {
            ctrl.init();
        });
    });

});
