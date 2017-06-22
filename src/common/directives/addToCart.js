/**
 * 添加至购物车动过效果
 */

    angular.module('app')
        .directive('cmAddToCartSource', function(messageCenter) {

            return {
                restrict: 'A',
                scope: false,
                link: function($scope, $el, $attrs) {
                    $el.on('click', function(e) {
                        var rect = $el[0].getBoundingClientRect();
                        messageCenter.publishMessage('cmAddToCart', {
                            left: rect.left + rect.width / 2,
                            top: rect.top + rect.height / 2
                        });
                    });
                }
            };
        })

    .directive('cmAddToCartTarget', function(messageCenter) {
        var PEAK_OFFSET = 40;
        var DOT_SPEED = 20;
        var DOT_ACCELERATION = 1.05;
        var ANIMATION_CLASS = 'add-to-cart-arrived';
        var ANIMATIONEND_EVENT = '';

        if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
            ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
        } else {
            ANIMATIONEND_EVENT = 'animationend';
        }

        var clientHeight = document.documentElement.clientHeight;
        var clientWidth = document.documentElement.clientWidth;
        window.addEventListener('resize', function() {
            clientHeight = document.documentElement.clientHeight;
            clientWidth = document.documentElement.clientWidth;
        });

        function isInView(left, top) {
            return left < clientWidth && left > 0 &&
                top < clientHeight && top > 0;
        }

        function animationEnd() {
            $(this).removeClass(ANIMATION_CLASS).off(ANIMATIONEND_EVENT, animationEnd);
        }

        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {
                var $target = $el;

                if ($attrs.cmAddToCartTarget != '$self') {
                    setTimeout(function () {
                        $target = $el.find($attrs.cmAddToCartTarget);
                    });
                }

                messageCenter.subscribeMessage('cmAddToCart', function(event, source) {
                    var rect = $target[0].getBoundingClientRect();
                    var target = {
                        left: rect.left + rect.width / 2,
                        top: rect.top + rect.height / 2
                    };
                    if (!$target.is(':visible') || !isInView(target.left, target.top)) {
                        return;
                    }

                    // 抛物线中间点
                    var middle = {
                        left: (source.left + target.left) / 2,
                        top: Math.min(source.top, target.top) -
                            PEAK_OFFSET *  (1 - Math.abs(source.top - target.top) / clientHeight * 2)
                    };

                    // 二次曲线公式 y = a*x*x + b*x + c
                    // source 作为坐标原点，则 c = 0
                    // 计算 a， b
                    middle.x = middle.left - source.left;
                    middle.y = source.top - middle.top;
                    target.x = target.left - source.left;
                    target.y = source.top - target.top;
                    var a = (middle.y - target.y * (middle.x / target.x)) /
                        (middle.x * middle.x - target.x * middle.x);
                    var b = (middle.y - a * middle.x * middle.x) / middle.x;

                    var $dot = $('<div class="add-to-cart-dot"></div>').css({
                        'left': source.left,
                        'top': source.top
                    }).appendTo($('body'));

                    var x = 0;
                    var y = 0;
                    var rate = target.x > 0 ? 1: -1;

        			ionic.requestAnimationFrame(function step() {
        				// 切线 y'=2ax+b
        				var tangent = 2 * a * x + b;
        				// y*y + x*x = speed
        				// (tangent * x)^2 + x*x = speed
        				// x = Math.sqr(speed / (tangent * tangent + 1));
        				x += rate * Math.sqrt(DOT_SPEED / (tangent * tangent + 1));
                        rate *= DOT_ACCELERATION;

        				if ((rate > 0 && x > target.x) || (rate < 0 && x < target.x)) {
        					x = target.x;
        				}
        				y = a * x * x + b * x;

        				$dot[0].style[ionic.CSS.TRANSFORM] = "translate3d("+ x + "px, " + -y + "px, 0)";

        				if (x !== target.x) {
        					ionic.requestAnimationFrame(step);
        				} else {
        					$dot.remove();
                            $target.removeClass(ANIMATION_CLASS)
                                .addClass(ANIMATION_CLASS).on(ANIMATIONEND_EVENT, animationEnd);
        				}
        			});

                });
            }
        };
    });
