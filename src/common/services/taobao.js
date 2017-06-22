/**
 * 封装淘宝开放平台相关业务操作
 */
angular.module('app.services').factory('taobaoService',function(
    $http, api, messageCenter, localStorage
){
    return {
        /**
         * 获取当前登录用户对应的 OpenIM 登录帐号，需要登录。
         */
        userInfo: function() {
            return api.get('/taobao/userInfo');
        },

        /**
         * 获取客服信息，需要登录。
         * @param {String} type - 客服类型
         */
        serviceInfo: function(type) {
            return api.get('/taobao/serviceInfo');
        }
    };
});
