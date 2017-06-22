/**
 * 在 ng-repeat 更新 ion-slide后，刷新 ion-slide-box
 */

angular.module('app')
    .directive('cmRefreshSlide', function ($timeout, $ionicSlideBoxDelegate) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {
                var handle = $ionicSlideBoxDelegate.$getByHandle($el.parent().attr('delegate-handle'));
                if ($scope.$first === true) {
                    handle.stop();
					handle.update();
                }
                if ($scope.$last === true) {
                    $timeout(function () {
    					handle.update();
    					handle.loop(true);
                        handle.start();
                    }, 1000);
                }
            }
        };
    })
;
