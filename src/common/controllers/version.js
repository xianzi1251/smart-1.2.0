angular.module('app.controllers').controller('versionCtrl', function(
    $scope, $state, nativeTransition, localStorage, advService, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 获取内容
        init: function() {
            advService.getAdvInfo('38ce7595d73411e6b0c500163e00f65e')
                .success(function(response) {
                    // 转义返回的文描html
                    ctrl.content = _.unescape(response.list[0][0].content);
                })
                .error(errorHandling);
        }

    });

    ctrl.init();

});
