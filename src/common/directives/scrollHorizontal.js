/**
 * 多个商品水平方向可滚动
 * 例如：详情页的推荐商品、首页频道、订单列表中的订单商品、物流信息中订单商品
 */
angular.module('app')
    .directive('cmScrollHorizontal', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $element, $attrs) {
                
                var lastPageX = 0;                                      // 滑动最后X方向的坐标点
                var moveLength = 0;                                     // 水平位移
                var $moveElementUl = $element.find('.img-items');       // 需要滑动的dom节点
                var $moveElementDiv = $element.find('.imgs-scroll');
                var lastLeft = 0;                                       // 当前滑动节点滑动前距离左侧的距离
                var activeLeft;                                         // 当前滑块需要移动的距离

                // 手指放在屏幕上时
                $element.on('touchstart', function(e) {
                    var touch = e.originalEvent.targetTouches[0];
                    lastPageX = touch.pageX;
                });

                // 手指在屏幕上滑动时
                $element.on('touchmove', function(e) {

                    var touch = e.originalEvent.targetTouches[0];
                    var pageX = touch.pageX;

                    var deltaX = pageX - lastPageX;

                    lastPageX = pageX;

                    // 获取当前手指滑动距离
                    moveLength = deltaX;

                    activeLeft = lastLeft + moveLength;

                    // 移动的最大值
                    var maxLength = parseInt($moveElementDiv.width()) - parseInt($moveElementUl.width());

                    if (activeLeft <= 0 && activeLeft >= maxLength) {
                        $moveElementUl.css('transform', 'translate3d(' + activeLeft + 'px, 0, 0)');

                        if (activeLeft == 0) {
                            lastLeft = 0;
                        } else if (activeLeft == maxLength) {
                            lastLeft = maxLength;
                        } else {
                            // 保存距左侧距离
                            lastLeft = activeLeft;
                        }
                    }
                    
                });
            }
        };
    })
;
