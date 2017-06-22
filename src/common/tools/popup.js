/**
 * 通用提示框和确认对话框
 */
angular.module('app.services').factory('popup', ["$ionicPopup", function(
    $ionicPopup, $translate,$rootScope
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
        }

    };
}]);
