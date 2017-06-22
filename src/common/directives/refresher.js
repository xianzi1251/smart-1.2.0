/**
 * 下拉刷新，on-refresh 属性绑定刷新回调
 */

angular.module('app')
    .directive('cmRefresher', function ($timeout, $compile, $ionicConfig) {

        var template = '<div class="ui-refresher"><div class="refresher-content">' +
            '<div class="icon-pulling"><i class="icon"></i></div><div class="text-pulling"></div></div></div>';

        function postLink($scope, $element, $attrs) {
            if ($ionicConfig.scrolling.jsScrolling()) {
                $element.remove();
                return;
            }

            $element.find('.icon').addClass($attrs.pullingIcon || 'ion-android-arrow-down');

            $element.find('.text-pulling').html($attrs.pullingText);

            var loadingFragment = '<ion-spinner icon="ios"></ion-spinner>';

            if ($attrs.refreshingIcon) {
                loadingFragment = '<div class="spinner"><i class="' +  $attrs.refreshingIcon + '"></i></div>';
            }

            var loadingText;
            if($attrs.refreshingText) {
                loadingText = '<div class="text-refreshing">' + $attrs.refreshingText + '</div>';
            }

            var $refresherContent = $element.children('.refresher-content');
            var refresherHeight = $refresherContent.height();
            var activeOffset = refresherHeight + 30;
            var scrollPanel = $element.parents('.ionic-scroll').eq(0);
            var scrollContent = scrollPanel.children()[0];
            var scrollTop = 0;
            var dragCount = 0;
            var dragTimeout;
            var dragStart = false;
            var lastPageX = 0;
            var lastPageY = 0;
            var sumX = 0;
            var lastPosition = 0;

            function showRefresher() {
                $element.css('opacity', 1);
            }

            function hideRefresher() {
                $element.css('opacity', 0);
            }

            hideRefresher();

            // 重置刷新状态
            function resetRefresher() {
                hideRefresher();
                lastPosition = 0;
                scrollContent.style[ionic.CSS.TRANSITION] = 'transform 0.3s ease';
                scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, 0, 0)';
                $element.removeClass('active inactive refreshing');
                $refresherContent.find('.spinner').remove();
                $refresherContent.find('.text-refreshing').remove();
            }

            scrollPanel.on('scroll', function(e) {
                var event = e.originalEvent;
                if (event.detail && event.detail.scrollTop) {
                    scrollTop = event.detail.scrollTop;
                } else {
                    scrollTop = event.target.scrollTop;
                }
            });

            scrollPanel.on('touchstart', function(e) {
                scrollContent.style[ionic.CSS.TRANSITION] = 'none';
                var touch = e.originalEvent.targetTouches[0];
                lastPageX = touch.pageX;
                lastPageY = touch.pageY;
                sumX = 0;
            });

            scrollPanel.on('touchmove', function(e) {
                var touch = e.originalEvent.targetTouches[0];
                var pageX = touch.pageX;
                var pageY = touch.pageY;
                var offset = pageY - lastPageY;
                sumX += Math.abs(pageX - lastPageX);
                lastPageX = pageX;
                lastPageY = pageY;
                if (!dragStart) {
                    if (sumX > 50) return;
                    if (scrollTop <= 0 && offset > 0) {
                        e.preventDefault();
                        if (offset > 50 || dragCount >= 10) {
                            dragCount = 0;
                            dragStart = true;
                            showRefresher();
                            clearTimeout(dragTimeout);
                        } else {
                            dragCount++;
                            clearTimeout(dragTimeout);
                            dragTimeout = setTimeout(function () {
                                dragCount = 0;
                            }, 100);
                        }
                    }
                } else {
                    var offsetTotal = Math.max(0, offset + lastPosition);
                    if (offsetTotal != lastPosition) {
                        ionic.requestAnimationFrame(function() {
                            var step = Math.floor(offsetTotal / 10);
                            var factor = 0.05;
                            var deceleration = 1 - factor;
                            var translateY = 0;
                            for (var i = 0; i < step; i++) {
                                translateY += 10 * deceleration;
                                if (deceleration > 0.3) {
                                    deceleration -= factor;
                                }
                            }
                            translateY += (offsetTotal % 10) * deceleration;
                            scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + translateY + 'px, 0)';
                        });
                        if (offsetTotal >= activeOffset) {
                            $element.addClass('active').removeClass('inactive');
                        } else if (lastPosition >= activeOffset) {
                            if ($element.hasClass('active')) {
                                $element.addClass('inactive');
                            }
                            $element.removeClass('active');
                        }
                        lastPosition = offsetTotal;
                    }
                    e.preventDefault();
                }
            });

            scrollPanel.on('touchend', function(e) {
                if (dragStart) {
                    if ($element.hasClass('refreshing')) {
                        lastPosition = refresherHeight;
                        ionic.requestAnimationFrame(function() {
                            scrollContent.style[ionic.CSS.TRANSITION] = 'transform 0.3s ease';
                            scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + refresherHeight + 'px, 0)';
                        });
                    } else if (lastPosition >= activeOffset) {
                        $scope.$eval($attrs.onRefresh);
                        $element.addClass('refreshing');
                        $refresherContent.append($compile(loadingFragment)($scope));
                        if (loadingText) {
                            $refresherContent.append($compile(loadingText)($scope));
                        }
                        lastPosition = refresherHeight;
                        ionic.requestAnimationFrame(function() {
                            scrollContent.style[ionic.CSS.TRANSITION] = 'transform 0.3s ease';
                            scrollContent.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + refresherHeight + 'px, 0)';
                        });
                    } else {
                        setTimeout(function () {
                            resetRefresher();
                        }, 100);
                    }
                    dragCount = 0;
                    dragStart = false;
                }
            });

            $scope.$on('scroll.refreshComplete', function() {
                resetRefresher();
            });
        }

        return {
            restrict: 'E',
            replace: true,
            template: template,
            scope: false,
            compile: function($element, $attrs) {
                if ($ionicConfig.scrolling.jsScrolling()) {
                    var refresher = '<ion-refresher';
                    if ($attrs.pullingIcon) {
                        refresher += ' pulling-icon="' + $attrs.pullingIcon + '"';
                    }
                    if ($attrs.refreshingIcon) {
                        refresher += ' refreshing-icon="' + $attrs.refreshingIcon + '"';
                    }
                    if($attrs.pullingText) {
                        refresher += ' pulling-text="' + $attrs.pullingText + '"';
                    }
                    if($attrs.refreshingText) {
                        refresher += ' refreshing-text="' + $attrs.refreshingText + '"';
                    }

                    refresher += ' on-refresh="' + $attrs.onRefresh + '"></ion-refresher>';
                    $element.after(refresher);
                }

                return {
                    post: postLink
                };
            }
        };
    })
;
