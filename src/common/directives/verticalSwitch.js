/**
 * 垂直拖动切换视图
 */
angular.module('app.directives')

.directive('cmVerticalSwitchUp', function($ionicScrollDelegate, $timeout, $ionicConfig) {

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attr) {
            var dragCount = 0;
            var dragTimeout;
            var handle = $ionicScrollDelegate.$getByHandle($element.attr('delegate-handle'));
            var target = $scope[$attr.cmVerticalSwitchUp];
            var lastPageX = 0;
            var lastPageY = 0;
            var sumX = 0;
            var scrollContent = $element.children();
            var overflowScroll = !$ionicConfig.scrolling.jsScrolling();

            $element.on('touchstart', function(e) {
                var touch = e.originalEvent.targetTouches[0];
                lastPageX = touch.pageX;
                lastPageY = touch.pageY;
                sumX = 50;
            });

            $element.on('touchmove', ionic.throttle(function(e) {
                if (sumX <= 0 || target.switched) return;
                var touches = e.originalEvent.targetTouches;
                if (touches.length > 1) {
                    dragCount = 0;
                    return;
                }
                var pageX = touches[0].pageX;
                var pageY = touches[0].pageY;
                sumX -= Math.abs(pageX - lastPageX);
                lastPageX = pageX;
                var offset = pageY - lastPageY;
                lastPageY = pageY;
                if (offset >= 0) return;

                var maxScrollTop = 0;
                if (overflowScroll) {
                    var contentHeight = 0;
                    scrollContent.children().each(function() {
                        contentHeight += $(this).outerHeight(true);
                    });
                    maxScrollTop = contentHeight - $element.height() - $element.find('.ui-refresher').outerHeight();
                } else {
                    maxScrollTop = handle.getScrollView().__maxScrollTop;
                }
                if (handle.getScrollPosition().top >= maxScrollTop - 5) {
                    e.preventDefault();
                    if (dragCount < 5) {
                        dragCount++;
                        clearTimeout(dragTimeout);
                        dragTimeout = setTimeout(function () {
                            dragCount = 0;
                        }, 100);
                    }
                    if (dragCount >= 5 || offset <= -100) {
                        $timeout(function() {
                            target.switched = true;
                            dragCount = 0;
                        });
                        clearTimeout(dragTimeout);
                    }
                }
            }, 40));
        }
    };
})

.directive('cmVerticalSwitchDown', function($ionicScrollDelegate, $timeout) {

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attr) {
            var scrollContent = $element.parent()[0];
            var dragCount = 0;
            var dragTimeout;
            var handle = $ionicScrollDelegate.$getByHandle($element.attr('delegate-handle'));
            var target = $scope[$attr.cmVerticalSwitchDown];
            var lastPageX = 0;
            var lastPageY = 0;
            var sumX = 0;
            var dragStart = false;
            var lastPosition = 0;

            function reset() {
                dragStart = false;
                lastPosition = 0;
                scrollContent.style[ionic.CSS.TRANSITION] = 'transform 0.3s ease';
                scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, 0, 0)';
                handle.freezeScroll(false);
            }

            $element.on('touchstart', function(e) {
                scrollContent.style[ionic.CSS.TRANSITION] = 'none';
                scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, 0, 0)';
                dragStart = false;
                lastPosition = 0;
                var touch = e.originalEvent.targetTouches[0];
                lastPageX = touch.pageX;
                lastPageY = touch.pageY;
                sumX = 50;
            });

            $element.on('touchmove', ionic.throttle(function(e) {
                if (sumX <= 0 || !target.switched) return;
                var touches = e.originalEvent.targetTouches;
                if (touches.length > 1) {
                    dragCount = 0;
                    return;
                }
                var pageX = touches[0].pageX;
                var pageY = touches[0].pageY;
                var offset = pageY - lastPageY;
                lastPageY = pageY;

                if (!dragStart) {
                    sumX -= Math.abs(pageX - lastPageX);
                    if (handle.getScrollPosition().top <= 0 && offset > 0) {
                        e.preventDefault();
                        if (dragCount >= 2) {
                            dragCount = 0;
                            dragStart = true;
                            clearTimeout(dragTimeout);
                            handle.freezeScroll(true);
                        } else {
                            dragCount++;
                            clearTimeout(dragTimeout);
                            dragTimeout = setTimeout(function () {
                                dragCount = 0;
                            }, 100);
                        }
                    }
                } else {
                    e.preventDefault();
                    var translateY = Math.max(0, Math.min(40, offset + lastPosition));
                    if (translateY != lastPosition) {
                        ionic.requestAnimationFrame(function() {
                            scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + translateY + 'px, 0)';
                        });
                        lastPosition = translateY;
                    }
                    if (lastPosition === 40) {
                        if (dragCount >= 10) {
                            dragCount = 0;
                            clearTimeout(dragTimeout);
                            reset();
                            $timeout(function() {
                                target.switched = false;
                            });
                        } else {
                            dragCount++;
                            clearTimeout(dragTimeout);
                            dragTimeout = setTimeout(function () {
                                dragCount = 0;
                            }, 100);
                        }
                    }
                }

                // if (handle.getScrollPosition().top === 0) {
                //     e.preventDefault();
                //     if (dragCount < 3) {
                //         dragCount++;
                //         clearTimeout(dragTimeout);
                //         dragTimeout = setTimeout(function () {
                //             dragCount = 0;
                //         }, 100);
                //     } else {
                //         $timeout(function() {
                //             target.switched = false;
                //             dragCount = 0;
                //         });
                //         clearTimeout(dragTimeout);
                //     }
                // }
            }, 30));

            $element.on('touchend', function(e) {
                setTimeout(reset, 100);
                if (lastPosition === 40) {
                    $timeout(function() {
                        target.switched = false;
                    });
                }
            });
        }
    };
});
