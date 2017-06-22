/**
 * 延迟图片加载，图片进入可视区时才进行加载
 * preLoadVertical  <Integer>  控制预加载高度，默认 50
 * preLoadHorizontal  <Integer>  控制预加载宽度，默认 30
 * loadImmediate  <Boolean>  不检测是否在可视范围内直接开始加载，默认 false
 * lazyloadWatch  <Boolean>  是否监视图片url变更更新图片，默认 false
 */
angular.module('app.directives')

.directive('cmLazyload', ["$document", function($document, imageLoader, utils) {
    // 延迟加载样式类
    var CLASS_LAZY_LOAD = 'lazyload';
    var CLASS_LOADED = 'lazyload-loaded';
    var CLASS_FINISHED = 'lazyload-finished';
    var ANIMATIONEND_EVENT = '';

    if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
        ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
    } else {
        ANIMATIONEND_EVENT = 'animationend';
    }
    // 占位图片
    var SPACER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////AAAAVcLTfgAAAAF0Uk5TAEDm2GYAAAAMSURBVHjaYmAACDAAAAIAAU9tWeEAAAAASUVORK5CYII=';
    // 加载失败后可重试次数上限
    var RETRY_LIMIT = 3;
    // 指令自增索引
    var count = 0;

    // 所有需要监听的滚动区
    var scrollMap = {};

    var clientHeight = $document[0].documentElement.clientHeight;
    var clientWidth = $document[0].documentElement.clientWidth;
    window.addEventListener('resize', function() {
        clientHeight = $document[0].documentElement.clientHeight;
        clientWidth = $document[0].documentElement.clientWidth;
    });

    // 添加滚动监听
    function addScrollHandler(scrollPanel, image) {
        var key = scrollPanel[0].$$hashKey;
        var scrollDelegate = scrollMap[key];
        if (!scrollDelegate) {
            // 滚动处理
            var scrollHandler = function(e) {
                var scrollTop = 0;
                var event = e.originalEvent;
                if (event.detail && event.detail.scrollTop) {
                    scrollTop = event.detail.scrollTop;
                } else {
                    scrollTop = event.target.scrollTop;
                }

                for (var id in scrollDelegate.images) {
                    var image = scrollDelegate.images[id];
                    if (!image.loading && isInView(image, scrollTop)) {
                        image.loading = true;
                        loadImage(image)
                            .success(imageLoadSuccessHandler(id))
                            .error(imageLoadErrorHandler(image));
                    }
                }
            };

            var imageLoadSuccessHandler = function(image) {
                return function() {
                    removeImageFromDelegate(image.id);
                    image.loading = false;
                };
            };

            var imageLoadErrorHandler = function(image) {
                return function() {
                    image.retryCount++;
                    if (image.retryCount >= RETRY_LIMIT) {
                        removeImageFromDelegate(image.id);
                    }
                    image.loading = false;
                };
            };

            var removeImageFromDelegate = function(id) {
                delete scrollDelegate.images[id];
                scrollDelegate.length--;

                // 滚动区内所有图片已加载时，不再监听滚动
                if (scrollDelegate.length === 0) {
                    scrollPanel.off('scroll', scrollDelegate.handler);
                    delete scrollMap[key];
                }
            };

            scrollDelegate = {
                scrollPanel: scrollPanel,
                images: {},
                length: 0,
                handler: ionic.throttle(scrollHandler, 200)
            };
            scrollPanel.on('scroll', scrollDelegate.handler);
            scrollMap[key] = scrollDelegate;
        }
        scrollDelegate.images[image.id] = image;
        scrollDelegate.length++;
    }

    // 检查元素是否在可视区垂直高度内
    function isInView(element, scrollTop) {
        var preLoadVertical = element.preLoadVertical;
        if (scrollTop !== undefined) {
            var top = element.offsetTop - scrollTop,
                bottom = top + element.height;

            return top <= clientHeight + preLoadVertical &&
                bottom >= -preLoadVertical;
        } else {
            var $element = element.$element;
            var imageRect = $element[0].getBoundingClientRect();
            return imageRect.top <= clientHeight + preLoadVertical &&
                imageRect.bottom >= -preLoadVertical;
        }
    }

    // 加载图片
    function loadImage(image) {
        var $element = image.$element;
        // 加载并缓存图片
        return imageLoader.load($element, image.src, function functionName() {
            $element.removeClass(CLASS_LAZY_LOAD).addClass(CLASS_LOADED);
        });
    }

    // 淡入动画结束后修改 class
    function animationEnd() {
        $(this).removeClass(CLASS_LOADED).addClass(CLASS_FINISHED);
    }

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attr) {
            var scrollPanel = $element.parents('.scroll-content').eq(0);
            var preLoadVertical = parseInt($attr.preLoadVertical) || 50;
            var preLoadHorizontal = parseInt($attr.preLoadHorizontal) || 30;
            var loadImmediate = $attr.loadImmediate;
            var image = null;

            // 初始化延迟加载
            function init() {
                var src = $scope.$eval($attr.cmLazyload);
                if (!src) {
                    return;
                }
                // 处理 watch 导致图片重加载
                if (image) {
                    $element.off(ANIMATIONEND_EVENT, animationEnd);
                    $element.removeClass(CLASS_LOADED).removeClass(CLASS_FINISHED);
                }
                $element[0].src = SPACER;
                $element.addClass(CLASS_LAZY_LOAD);
                $element.on(ANIMATIONEND_EVENT, animationEnd);
                image = {
                    id: count++,
                    $element: $element,
                    loading: false,
                    retryCount: 0,
                    src: src,
                    preLoadVertical: preLoadVertical,
                    preLoadHorizontal: preLoadHorizontal
                };

                setTimeout(function () {
                    angular.extend(image, utils.getElementRect($element));
                    if (loadImmediate || isInView(image)) {
                        loadImage(image);
                    } else {
                        addScrollHandler(scrollPanel, image);
                    }
                }, 0);
            }

            if ($attr.lazyloadWatch) {
                var listener = $scope.$watch($attr.cmLazyload, init);
                $scope.$on('$destroy', listener);
            } else {
                init();
            }
        }
    };
}]);
