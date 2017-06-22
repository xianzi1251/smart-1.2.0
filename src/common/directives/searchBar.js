angular.module('app.directives').directive('cmSearchBar', function factory($timeout) {
    return function($scope, $el, $attrs) {

        var input = $el.find('input[type=search]');

        // input.keyup(function(e) {
        //     $scope.$apply(function() {
        //         if (e.which === 13) {
        //             input.blur();
        //         }
        //     });
        // });

        // $scope.$on('$ionicView.enter', function() {
        //     input.focus();
        // });

        $scope.$on('$ionicView.beforeLeave', function() {
            input.blur();
        });
    };
});
