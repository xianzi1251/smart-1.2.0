/**
 * 关于 tab 项的配置
 * 因为 ionic 不支持使用 ng-repeat 动态创建 tab 项，因此如果有修改这里的配置，
 * 都请到 tabs.html 模板文件中手动更新一遍
 */
angular.module('app').constant('tabs', [
    {
        name: 'index',
        iconOn: 'ion-ios7-home',
        iconOff: 'ion-ios7-home-outline',
        href: '#/tabs/index'
    },
    {
        name: 'categories',
        iconOn: 'ion-ios7-keypad',
        iconOff: 'ion-ios7-keypad-outline',
        href: '#/tabs/categories'
    },
    {
        name: 'purchased',
        iconOn: 'ion-ios7-keypad',
        iconOff: 'ion-ios7-keypad-outline',
        href: '#/tabs/purchasedList'
    },
    {
        name: 'cart',
        iconOn: 'ion-ios7-cart',
        iconOff: 'ion-ios7-cart-outline',
        href: '#/tabs/cart'
    },
    {
        name: 'user',
        iconOn: 'ion-ios7-person',
        iconOff: 'ion-ios7-person-outline',
        href: '#/tabs/user'
    }
]);
