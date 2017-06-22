/**
 * 设置订单列表页商品滑动容器宽度
 */

angular.module('app')
    .directive('cmAdjustParentWidth', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {
                var additionalWidth = +$attrs.cmAdjustParentWidth || 0;
                if ($scope.$last === true) {
                    $timeout(function () {
                        var width = $el.outerWidth(true) + 1,
                            siblings = $el.siblings();
                        for (var i = 0; i < siblings.length; i++) {
                            width += $(siblings[i]).outerWidth(true) + 1;
                        }
                        $el.parent().css('width', (width + additionalWidth) + 'px');
                    });
                }
            }
        };
    })
;
