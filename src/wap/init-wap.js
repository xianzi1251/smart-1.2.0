// 修改全局配置对象
// -----------------------------------------------------------------------------
_.assign(window.APP_CONFIG, {
    // wxshop地址
    wxService: '<<< wxService >>>',

    // 系统类型： ['android', 'ios', 'weixin', 'wap']
    os: 'wap',
    // 系统版本
    osVersion: ionic.Platform.version(),
    // serviceAPI: 'http://byt.smartcloudcn.com'
    serviceAPI: 'http://app.banyuetan.org:88'
});

// 移动站初始化操作
// -----------------------------------------------------------------------------

var app = angular.module('app');

// 配置 ionic
app.config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.scrolling.jsScrolling(true);
    $ionicConfigProvider.views.transition('none');
});

// 平台相关的路由状态
app.constant('platformStates', {});

//平台相关的在每一个 tab 项下都要提供的状态配置
app.constant('platformStatesForEveryTab', {

});
