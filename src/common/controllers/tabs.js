/**
 * Tabs 的控制器
 */
angular.module('app.controllers').controller('tabsCtrl', function(
    $scope, $state, tabs
) {
    this.configs = tabs;
});
