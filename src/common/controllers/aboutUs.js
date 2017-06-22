angular.module('app.controllers').controller('aboutUsCtrl', function(
    $scope, $state, nativeTransition, localStorage, advService, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        // 获取当前版本号
        version: localStorage.get('appVersion'),

        // 获取内容
        init: function() {
            advService.getAdvInfo('6678e433d73411e6b0c500163e00f65e')
                .success(function(response) {
                    // 转义返回的文描html
                    ctrl.content = _.unescape(response.list[0][0].content);
                })
                .error(errorHandling);
        },

        // 打开版权声明
        goVersion: function () {
            nativeTransition.forward();
            $state.go('tabs.version');
        }

    });

    ctrl.init();

});
