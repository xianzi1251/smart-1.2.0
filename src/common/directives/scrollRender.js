/**
 * 元素离开可视区时从 dom 中移除残存，进入可视区时重新添加回 dom
 */
angular.module('app.directives')

.directive('cmScrollRender', function($document, utils) {
    // 滚动区内注册元素数到达阈值后开始动态置换
    var THRESHOLD = 5;
    // 元素分组容量
    var BLOCK_SIZE = 10;
    // 预加载倍率，基于可视区
    var PRELOAD_VERTICAL = 2;
    var PRELOAD_HORIZONTAL = 2;
    // 指令自增索引
    var itemCount = 0;
    var blockCount = 0;

    // 所有需要监听的滚动区
    var scrollMap = {};

    var clientHeight = $document[0].documentElement.clientHeight;
    var clientWidth = $document[0].documentElement.clientWidth;

    window.addEventListener('resize', function() {
        var key, scrollDelegate, elements, element, $element, $content, elementSize;

        clientHeight = $document[0].documentElement.clientHeight;
        clientWidth = $document[0].documentElement.clientWidth;
    });

    // 元素对象
    function Item($element) {
        this.id = itemCount++;
        this.$element = $element;
        this.$content = null;
        this.hided = false;
        this.blockId = null;
        angular.extend(this, utils.getElementRect($element));
        $element.css({
            width: this.width,
            height: this.height
        });
        return this;
    }

    Item.prototype.render = function() {
        if (!this.hided) return;
        this.hided = false;
        renderQueue[this.id] = this;
        reRender();
    };

    Item.prototype.cache = function() {
        if (this.hided) return;
        this.hided = true;
        hideQueue[this.id] = this;
        reRender();
    };

    var renderQueue = {};
    var hideQueue = {};
    var hasReRenderTask = false;

    // 重绘需要显示或隐藏的元素
    function reRender() {
        if (hasReRenderTask) return;
        hasReRenderTask = true;
        ionic.requestAnimationFrame(reRenderTask);
    }

    function reRenderTask() {
        var i, element, contentContainer;
        // 渲染元素
        contentContainer = $();
        for (i in renderQueue) {
            element = renderQueue[i];
            if (!element.hided) {
                contentContainer = contentContainer.add(element.$content);
                element.$content = null;
            }
        }
        contentContainer.show();

        // 隐藏元素
        contentContainer = $();
        for (i in hideQueue) {
            element = hideQueue[i];
            if (element.hided) {
                var $element = element.$element;
                element.$content = $element.children();
                contentContainer = contentContainer.add(element.$content);
            }
        }
        contentContainer.hide();

        renderQueue = {};
        hideQueue = {};
        hasReRenderTask = false;
    }

    // 分组对象
    function Block() {
        this.id = blockCount++;
        this.items = {};
        this.length = 0;
        return this;
    }

    Block.prototype.addItem = function(item) {
        this.items[item.id] = item;
        this.length++;
        item.blockId = this.id;
        this.calculateBlockRect();
        return this;
    };

    Block.prototype.removeItem = function(item) {
        if (this.items[item.id] === item) {
            delete this.items[item.id];
            item.blockId = null;
            this.length--;
            this.calculateBlockRect();
        }
        return this;
    };

    Block.prototype.calculateBlockRect = function() {
        var top = null;
        var bottom = 0;

        for (var id in this.items) {
            var item = this.items[id];
            if (top === null || item.offsetTop < top) {
                top = item.offsetTop;
            }
            var offsetBottom = item.offsetTop + item.height;
            if (offsetBottom > bottom) {
                bottom = offsetBottom;
            }
        }

        this.offsetTop = top;
        this.height = bottom - top;
        return this;
    };

    Block.prototype.isFilled = function() {
        return this.length >= BLOCK_SIZE;
    };

    Block.prototype.isInView = function(scrollTop) {
        var top = this.offsetTop - scrollTop,
            bottom = top + this.height;

        return top <= clientHeight * (1 + PRELOAD_VERTICAL) &&
            bottom >= -clientHeight * PRELOAD_VERTICAL;
    };

    Block.prototype.render = function() {
        for (var id in this.items) {
            this.items[id].render();
        }
        return this;
    };

    Block.prototype.cache = function() {
        for (var id in this.items) {
            this.items[id].cache();
        }
        return this;
    };

    function ScrollDelegate(scrollPanel) {
        var self = this;
        this.scrollPanel = scrollPanel;
        this.blocks = {};
        this.lastBlock = null;
        this.length = 0;
        this.handler = ionic.throttle(function(e) {
            if (self.length < THRESHOLD) return;

            var scrollTop = 0;
            var event = e.originalEvent;
            if (event.detail && event.detail.scrollTop) {
                scrollTop = event.detail.scrollTop;
            } else {
                scrollTop = event.target.scrollTop;
            }

            for (var id in self.blocks) {
                var block = self.blocks[id];
                if (block.isInView(scrollTop)) {
                    block.render();
                } else {
                    block.cache();
                }
            }
        }, 200);
        scrollMap[scrollPanel[0].$$hashKey] = this;
        scrollPanel.on('scroll', this.handler);
        return this;
    }

    ScrollDelegate.getDelegate = function (scrollPanel) {
        return scrollMap[scrollPanel[0].$$hashKey] || new ScrollDelegate(scrollPanel);
    };

    ScrollDelegate.prototype.addItem = function (item) {
        var block = this.lastBlock;
        if (block && !block.isFilled()) {
            block.addItem(item);
        } else {
            block = new Block();
            block.addItem(item);
            this.blocks[block.id] = block;
            this.lastBlock = block;
            this.length++;
        }
        return this;
    };

    ScrollDelegate.prototype.removeItem = function (item) {
        var block = this.blocks[item.blockId];
        if (block) {
            block.removeItem(item);

            if (block.length === 0) {
                delete this.blocks[block.id];
                this.length--;
                if (this.lastBlock === block) {
                    this.lastBlock = null;
                }
            }

            if (this.length === 0) {
                this.scrollPanel.off('scroll', this.handler);
                delete scrollMap[this.scrollPanel[0].$$hashKey];
            }
        }
        return this;
    };

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attr) {
            var scrollPanel = $element.parents('.scroll-content').eq(0);

            // 延迟1秒获取元素坐标和尺寸并添加滚动监听
            setTimeout(function() {
                if ($scope.$$destroyed || !$element.is(':visible')) return;
                var item = new Item($element);
                var scrollDelegate = ScrollDelegate.getDelegate(scrollPanel);
                scrollDelegate.addItem(item);

                $scope.$on('$destroy', function() {
                    scrollDelegate.removeItem(item);
                });
            });
        }
    };
});
