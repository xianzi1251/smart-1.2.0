/**
 * 商品评论页商品图片放大缩小并可滑动
 */
angular.module('app.directives')

    .directive('cmImagePreviewScale', function($ionicScrollDelegate) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attr) {

                var winWidth = window.innerWidth,
                    winHeight = window.innerHeight;

                // 获取$ionicScrollDelegate注册的所有事件柄
                var handles = angular.element(document.body).injector().get('$ionicScrollDelegate')._instances;

                // 获取当前handle
                var handle = null;

                /*
                 * 当前scroll处于放大状态时，slider禁止滚动
                 */
                $element.on('touchstart touchend', function(event) {
                
                    // 获取当前swiper-slider的索引值 
                    var activeIndex;
                    if ($scope.imageCount > 1) {
                        activeIndex = $scope.activeIndex;
                    } else {
                        activeIndex = 0;
                    }

                    // 获取当前滚动的scroll
                    var oScroll = $element.find('.swiper-slide').eq(activeIndex).find('.img-preview-slide-scroll'),

                        // 获取当前scroll的放大比例
                        scrollTransformScale,

                        // 获取ion-scroll的translateY值，使图片垂直居中
                        scrollTranslateY = 0;

                    // 获取当前handle
                    for (var i = 0, length = handles.length; i < length; i++) {
                        var item = handles[i];
                        if (item.$element[0] === oScroll[0]) {
                            handle = item;
                            break;
                        }
                    }

                    // 获取当前scroll缩放比例
                    scrollTransformScale = handle.getScrollView().__scheduledZoom;

                    if (scrollTransformScale > 1) {

                        // 禁止swiper滑动
                        $element.find('.swiper-slide').addClass('swiper-no-swiping');

                        if (winWidth * scrollTransformScale < winHeight) {

                            // 计算ion-scroll垂直居中的translateY
                            scrollTranslateY = (winHeight - winWidth * scrollTransformScale) / 2;

                            // 禁止垂直方向滚动
                            handle.getScrollView().options.scrollingY = false;

                        } else {
                            scrollTranslateY = 0;

                            // 允许垂直方向滚动
                            handle.getScrollView().options.scrollingY = true;
                        }

                    } else {

                        // 允许swiper滑动
                        $element.find('.swiper-slide').removeClass('swiper-no-swiping');

                        // 计算ion-scroll垂直居中的translateY
                        scrollTranslateY = (winHeight - winWidth) / 2;

                        // 禁止垂直方向滚动
                        handle.getScrollView().options.scrollingY = false;

                    }

                    $element.find('.swiper-slide').eq(activeIndex).find('.img-preview-slide-scroll').css('transform', 'translate3d(0, ' + scrollTranslateY + 'px, 0)');

                    event.preventDefault();

                });
            }
        };

    });