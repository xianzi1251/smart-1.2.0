/**
 * 计算top值
 */

angular.module('app')
    .directive('cmCaculateTop', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {

                $timeout(function () {

                    // 当前内容高度
                    var currentHeight = $el.find('.radio-and-article-cont').height();

                    $el.find('.info-scroll').css({top: currentHeight + 2});
                });
            }
        };
    })
;
