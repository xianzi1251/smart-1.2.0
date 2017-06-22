/**
 * 动态绑定html片段.
 */

angular.module('app')
    .directive('cmBindHtml', function factory($compile, $ionicScrollDelegate) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {
                var listener = $scope.$watch(
                    function() {
                        return $scope.$eval($attrs.cmBindHtml);
                    },
                    function(newValue) {
                        $el[0].innerHTML = '';
                        if (newValue && newValue.trim()) {
                            $el.append($compile(newValue)($scope));
                        }
                        $ionicScrollDelegate.resize();
                    });

                $scope.$on('$destroy', function() {
                    listener();
                });
            }
        };
    })
;
