angular.module('app.controllers').controller('userAccountBindPayCtrl', function(
    $scope
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 去app store设置
        goAppStore: function() {

            // 链接
            var url = 'itms-apps://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/DirectAction/editAddress';

            if (window.cordova && window.cordova.InAppBrowser) {
                window.cordova.InAppBrowser.open(url, '_system');
            } else {
                window.open(url);
            }
        }

    });

});
