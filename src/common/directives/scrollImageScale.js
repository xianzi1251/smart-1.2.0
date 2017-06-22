/**
 * 会员中心首页下拉，顶部背景图片放大
 */
angular.module('app.directives')

.directive('cmScrollImageScale', function($ionicScrollDelegate) {

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $el, $attr) {

            var oCard = $el.find('.card'),
                oImage = oCard.find('.user-banner-img'),
                oContent = oCard.find('.user-banner-content'),
                cardHeight = oCard.height();

            $el.on('scroll', function(e) {

                var scrollTop = $ionicScrollDelegate.getScrollPosition().top;

                // 当前面板处向下拖动时触发
                if (scrollTop <= 0) {

                    var activeScale = 1 + Math.abs(scrollTop / cardHeight);

                    ionic.requestAnimationFrame(function () {
                        oImage.css({'transform': 'translate3d(-50%, ' + (scrollTop / 2) + 'px, 0) scale(' + activeScale + ')'});
                        oContent.css({'transform': 'translate3d(0, ' + (scrollTop / 2) + 'px, 0)'});

                    });
                }
                
            });

        }
    };
});
