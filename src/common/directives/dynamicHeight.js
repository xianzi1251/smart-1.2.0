/**
 * 动态计算并设置高度
 */

angular.module('app.directives').directive('cmDynamicHeight', function(
    $rootScope, $timeout
) {
    var _r_width = /\$width\b/;

    return {
        restrict: 'A',
        priority: 1,
        link: function($scope, $el, $attrs) {
            var expression = $attrs.cmDynamicHeight,
                el = $el[0],
                h;

            $timeout(setHeight);

            window.addEventListener('resize', setHeight);
            h = $rootScope.$on('$ionicView.enter', setHeight);

            function setHeight() {
                if ($el.is(':hidden')) return;

                var width = $el.width(),
                    height = $scope.$eval(expression, {
                        $width: width
                    });

                if (height == null) height = '';

                if (typeof height === 'number') {
                    height = height + 'px';
                }

                el.style.height = height;

                $scope.$broadcast('resize', {
                    width: width,
                    height: height
                });
            }

            $scope.$on('$destroy', function() {
                window.removeEventListener('resize', setHeight);
                h();
            });        
        }
    };
})
;
