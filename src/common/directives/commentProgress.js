/**
 * 体验店圆形评分进度条 - 后期去掉了该功能
 */

angular.module('app')
    .directive('cmCommentProgress', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {

                var num = (100 - $attrs.cmCommentProgress / 5 * 100) * 3.6,
                    $left = $el.find('.progress-left'),
                    $right = $el.find('.progress-right');

                if (num <= 180) {
                    $right.css('transform', 'rotate(' + num + 'deg)');
                } else {
                    $right.css('transform', 'rotate(180deg)');
                    $left.css('transform', 'rotate(' + (num - 180) + 'deg)');
                };

            }
        };
    })
;
