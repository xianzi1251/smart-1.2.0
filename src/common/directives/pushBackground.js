/**
 * 弹出层开启后背景纵深动画效果
 */

angular.module('app')
    .directive('cmPushBackground', function ($timeout, messageCenter) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {

                var $ionNavView = $('body > .view-container');
                var $ionView = $ionNavView.children('.pane');

                $ionNavView.css('background', '#000');
                $ionView.css({'transition': 'transform 0.3s'});

                $scope.$on('$destroy', function() {
                    $ionNavView.css('background', 'none');
                    $ionView.css({'transition': 'transform 0.3s'});
                });

            }
        };
    })
;
