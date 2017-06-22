 /**
 * 封装全局通用业务操作
 */
angular.module('app.services').factory('globalService',function(
    $http, api,toast
){
    return {

        // 公共上传图片  base64
        uploadImage: function(pic, type) {
            var params = {
              pic: pic,
              location: type
            };
            return api.post('/global/uploadImage', params, {timeout:60000});
        },

        /**
         * 获取应用版本
         */
        getVersion: function() {
            return api.post('/cosmos.json?command=scommerce.SC_SYS_SITE_SETTINGS_GET_VERSION', {
                    proName: 'SC_SYS_SITE_SETTINGS_GET_VERSION'
                });
        }
    };
});
