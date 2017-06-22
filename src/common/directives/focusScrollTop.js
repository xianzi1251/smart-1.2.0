/**
 * 个人反馈中，textarea获取焦点后，content滚动到顶部
 */

angular.module('app')
    .directive('cmFocusScrollTop', function ($ionicScrollDelegate) {
        return {
            restrict: 'A',
            link: function($scope, $el, $attrs) {
                $el.on('click', function () {
                    var $content = $ionicScrollDelegate.$getByHandle('feedbackContent');
                    $content.scrollTop();
                    $content.resize();
                });
            }
        };
    })
;
