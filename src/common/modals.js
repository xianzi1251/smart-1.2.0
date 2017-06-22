/**
 * 定义弹出层
 * title    属性用于统计页面访问
 */
angular.module('app').constant('modals', {

    // 加入购物车
    addToCart: {
        path: 'templates/modals/addToCart.html',
        controller: 'addToCartCtrl',
        controllerAs: 'addToCart',
        animation: 'slide-in-up'
    },

    // 立即购买
    buyNow: {
        path: 'templates/modals/buyNow.html',
        controller: 'buyNowCtrl',
        controllerAs: 'buyNow',
        animation: 'slide-in-up'
    },

    // 结算
    checkout: {
        path: 'templates/modals/checkout.html',
        controller: 'checkoutCtrl',
        controllerAs: 'checkout',
        animation: 'slide-in-up'
    },

    // 支付成功
    paymentOrderSuccess: {
        path: 'templates/modals/paymentOrderSuccess.html',
        controller: 'paymentOrderSuccessCtrl',
        controllerAs: 'success',
        animation: 'slide-in-up'
    },

    // 支付失败
    paymentOrderFail: {
        path: 'templates/modals/paymentOrderFail.html',
        controller: 'paymentOrderFailCtrl',
        controllerAs: 'fail',
        animation: 'slide-in-up'
    },

    // 未支付时，选择支付方式
    choosePayment: {
        path: 'templates/modals/choosePayment.html',
        controller: 'choosePaymentCtrl',
        controllerAs: 'choosePayment',
        animation: 'slide-in-up'
    },

    // 登录
    login: {
        path: 'templates/modals/login.html',
        controller: 'loginCtrl',
        controllerAs: 'login',
        animation: 'slide-in-up'
    },

    // 注册
    register: {
        path: 'templates/modals/register.html',
        controller: 'registerCtrl',
        controllerAs: 'register',
        animation: 'slide-in-up'
    },

    // 忘记密码
    forgetPwd: {
        path: 'templates/modals/forgetPwd.html',
        controller: 'forgetPwdCtrl',
        controllerAs: 'forgetPwd',
        animation: 'slide-in-up'
    },

    // 用户注册协议
    agreement: {
        path: 'templates/modals/agreement.html',
        animation: 'slide-in-up'
    },

    // 引导图
    upgrade: {
        path: 'templates/modals/upgrade.html',
        controller: 'upgradeCtrl',
        controllerAs: 'upgrade',
        animation: 'fade-out'
    },

    // 新增收货地址
    consigneeAdd: {
        path: 'templates/modals/consigneeAdd.html',
        controller: 'consigneeAddCtrl',
        controllerAs: 'consigneeAdd',
        animation: 'slide-in-up'
    },

    // 选择收货地区
    selectAddressRegion: {
        path: 'templates/modals/selectAddressRegion.html',
        controller: 'selectAddressRegionCtrl',
        controllerAs: 'selectAddressRegion',
        animation: 'slide-in-right',
        title: '选择收货地区'
    },

    // 结算中心收货地址列表
    checkoutConsigneeList: {
        path: 'templates/modals/checkoutConsigneeList.html',
        controller: 'checkoutConsigneeListCtrl',
        controllerAs: 'checkoutConsigneeList',
        animation: 'slide-in-up'
    }

});
