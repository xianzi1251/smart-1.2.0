/**
 * 通用提示框和确认对话框
 */
angular.module('app.services').factory('popup', ["$ionicPopup", function(
    $ionicPopup, $translate, $rootScope
) {
    return {

        // 确认对话框
        confirm: function(title, content) {
            return $ionicPopup.confirm({
                title: $translate.instant(title),
                template: $translate.instant(content),
                okText: '确定',
                okType: 'button-primary',
                cancelText: '取消',
                cancelTpye: 'button-stable'
            });
        },

        // 版本更新确认对话框
        updateConfirm: function(content) {
            return $ionicPopup.confirm({
                title: '版本更新',
                template: $translate.instant(content),
                okText: '更新',
                okType: 'button-primary',
                cancelText: '取消'
            });
        },

        // 版本更新提示框
        updateAlert: function(content, url) {
            return $ionicPopup.show({
                title: '版本更新',
                template: $translate.instant(content),
                buttons: [{
                    text: '更新',
                    type: 'button-primary',
                    onTap: function(e) {
                        e.preventDefault();
                        cordova.InAppBrowser.open(url, '_system');
                    }
                }]
            });
        }

    };
}]);
