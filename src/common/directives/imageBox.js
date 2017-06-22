/**
 * 图片盒子
 */
angular.module('app.directives').directive('cmImageBox', function(
    $compile
) {
    /**
     * 将原尺寸缩放使之能够填充目标尺寸，缩放后尺寸小于或等于目标尺寸，
     * 且有一边与原尺寸相同。
     * @param w1 目标尺寸 - 宽度
     * @param h1 目标尺寸 - 高度
     * @param w2 原尺寸 - 宽度
     * @param h2 原尺寸 - 高度
     */
    function contain(w1, h1, w2, h2) {
        var ar1 = w1 / h1,  // aspect ratio
            ar2 = w2 / h2,
            tw, th,
            tz;

        if (ar1 > ar2) {
            tz = h1 / h2;
            tw = w2 * tz; th = h1;
        }
        else if (ar1 < ar2) {
            tz = w1 / w2;
            tw = w1; th = h2 * tz;
        }
        else {
            tz = w1 / w2;
            tw = w1; th = h1;
        }

        return { width: tw, height: th, zoom: tz };
    }

    /**
     * 将原尺寸缩放使之能够填充目标尺寸，缩放后尺寸大于或等于目标尺寸，
     * 且有一边与原尺寸相同。
     * @param w1 目标尺寸 - 宽度
     * @param h1 目标尺寸 - 高度
     * @param w2 原尺寸 - 宽度
     * @param h2 原尺寸 - 高度
     */
    function cover(w1, h1, w2, h2) {
        var ar1 = w1 / h1,  // aspect ratio
            ar2 = w2 / h2,
            tw, th,
            tz;

        if (ar1 > ar2) {
            tz = w1 / w2;
            tw = w1; th = h2 * tz;
        }
        else if (ar1 < ar2) {
            tz = h1 / h2;
            tw = w2 * tz; th = h1;
        }
        else {
            tz = w1 / w2;
            tw = w1; th = h1;
        }

        return { width: tw, height: th, zoom: tz };
    }

    /**
     * 图片头数据加载就绪事件 - 更快获取图片尺寸
     * @author  TangBin
     * @see     http://www.planeart.cn/?p=1121
     * @param   {String}      图片路径
     * @param   {Function}    尺寸就绪
     * @param   {Function}    加载完毕 (可选)
     * @param   {Function}    加载错误 (可选)
     * @example
     *      imgReady(
     *          'http://www.site.com/image/01.jpg',
     *          function() {
     *              alert('size Ready: width = ' + this.width + '; height = ' + this.height);
     *          }
     *      );
     */
    var imgReady = (function () {
        var list = [], intervalId = null,

            // 用来执行队列
            tick = function () {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },

            // 停止所有定时器队列
            stop = function () {
                clearInterval(intervalId);
                intervalId = null;
            };

        return function (url, ready, load, error) {
            var onready, width, height, newWidth, newHeight,
                img = new Image();

            img.src = url;

            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready.call(img);
                load && load.call(img);
                return;
            };

            width = img.width;
            height = img.height;

            // 加载错误后的事件
            img.onerror = function () {
                error && error.call(img);
                onready.end = true;
                img = img.onload = img.onerror = null;
            };

            // 图片尺寸就绪
            onready = function () {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height ||
                    // 如果图片已经在其他地方加载可使用面积检测
                    newWidth * newHeight > 1024
                   ) {
                       ready.call(img);
                       onready.end = true;
                   };
            };
            onready();

            // 完全加载完毕的事件
            img.onload = function () {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();

                load && load.call(img);

                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };

            // 加入队列中定期执行
            if (!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })();

    return {
        restrict: 'EA',

        priority: 0,

        scope: {
            // 图片路径
            src: '@?'
        },

        compile: function(el, attrs) {
            var $el = $(el);
            $el.addClass('image-box').css({
                position: 'relative',
                overflow: 'hidden'
            });

            return function($scope, $element, $attrs) {
                // 待加载的图片
                var image = undefined;

                $scope.$on('resize', function(event, newSize) {
                    compute();
                });

                imgReady(
                    $scope.src,
                    // 图片预加载完成
                    function() {
                        image = $(this);
                        image.data('original-width', this.width);
                        image.data('original-height', this.height);
                    },
                    // 图片加载完成
                    function() {
                        insert();
                    },
                    // 图片加载失败
                    function() {
                    });

                /**
                 * 将图片插入容器中
                 */
                function insert() {
                    if (!image) { return; }

                    $element.append(image);
                    compute();
                }

                /**
                 * 计算图片的显示尺寸及位置
                 */
                function compute() {
                    if (!image) { return; }

                    var boxWidth = $element.innerWidth(),
                        boxHeight = $element.innerHeight(),

                        originalWidth = image.data('original-width'),
                        originalHeight = image.data('original-height'),

                        computedImageSize = contain(boxWidth, boxHeight, originalWidth, originalHeight),

                        x = (boxWidth - computedImageSize.width) / 2,
                        y = (boxHeight - computedImageSize.height) / 2;

                    image.css({
                        position: 'absolute',
                        width: computedImageSize.width,
                        height: computedImageSize.height,
                        left: x,
                        top: y
                    });

                }
            };
        }
    };
});
