angular.module('app.controllers').controller('checkoutAmountCtrl', function(
    $scope, $params
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        data: $params.data

    });
});
