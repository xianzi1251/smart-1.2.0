/**
 * 滚动到一定高度时显示浮动面板
 * 显示面板时会设置样式 transform: translate3d(0, 0, 0)，初始状态需要由css设置
 */
angular.module('app.directives')

.directive('cmScrollShow', function($document, $ionicScrollDelegate) {

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attr) {
            var scrollPanel = $element.siblings('.ionic-scroll').eq(0);
            var percentage = $scope.$eval($attr.cmScrollShow) || 0.5;
            var starty = scrollPanel.height() * percentage;

            var shown = false;

            scrollPanel.on('scroll', function(e) {
                var scrollTop = 0;
                var event = e.originalEvent;
                if (event.detail && event.detail.scrollTop) {
                    scrollTop = event.detail.scrollTop;
                } else {
                    scrollTop = event.target.scrollTop;
                }

                if (!shown && scrollTop > starty) {
                    $element.css('transform', 'translate3d(0, 0, 0)');
                    shown = true;
                }
                if (shown && scrollTop <= starty) {
                    $element.css('transform', '');
                    shown = false;
                }
            });

            $scope.$on('$ionicView.afterEnter', function() {
                if (shown) {
                    $element.css('transform', 'translate3d(0, 0, 0)');
                } else {
                    $element.css('transform', '');
                }
            });
        }
    };
});
