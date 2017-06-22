/**
 * 切换器，用于实现多面板的切换操作
 */
angular.module('app.directives').directive('cmSwitcher', function() {
    return {
        scope: {
            onSwitch: '&'
        },

        // @ngInject
        controller: function($scope, $element, $attrs, cmSwitcherDelegate, History) {
            var self = this,

                // 存放切换器内的所有面板元素
                panels = $element.find('> .panel'),

                // 存放切换历史
                history = new History();

            _.assign(self, {
                /**
                 * 当前面板元素
                 */
                current: null,

                /**
                 * 当前面板索引
                 */
                currentIndex: null,

                /**
                 * 是否已经切换到第一个面板
                 */
                isFirst: false,

                /**
                 * 是否已经切换到最后一个面板
                 */
                isLast: false,

                /**
                 * 当前面板数量
                 */
                length: panels.length,

                /**
                 * 是否已经切换到第一个面板，为 isFirst 属性的获取器。
                 */
                getIsFirst: function() {
                    return self.isFirst;
                },

                /**
                 * 是否已经切换到最后一个面板，为 isLast 属性的获取器。
                 */
                getIsLast: function() {
                    return self.isLast;
                },

                /**
                 * 获取当前面板索引，为 currentIndex 属性的获取器。
                 */
                getCurrentIndex: function() {
                    return this.currentIndex;
                },

                /**
                 * 获取当前面板总数量，为 length 属性的获取器。
                 */
                getLength: function() {
                    return this.length;
                },

                /**
                 * 切换到当前面板的上一个面板
                 * @return 若当前面板的上一个面板存在且可以切换，则返回 true，否则返回 false。
                 */
                prev: function() {
                    return self.switch(this.currentIndex - 1);
                },

                /**
                 * 切换到当前面板的下一个面板
                 * @return 若当前面板的下一个面板存在且可以切换，则返回 true，否则返回 false。
                 */
                next: function() {
                    self.switch(this.currentIndex + 1);
                },

                /**
                 * 切换到所指定的面板
                 * @param flag {number|string} 若为数字，则为要切换面板的索引，若为字符串，则为一个筛选选择器。
                 * @return 若需切换的面板存在且可以切换，则返回 true，否则返回 false。
                 */
                switch: function(flag) {
                    var result = this._switch(flag);

                    if (result) {
                        history.appendNode(result);
                    }
                },

                /**
                 * 返回到上一次切换时的当前面板
                 */
                backup: function() {
                    
                    if(history.lastNode) {
                        var index = history.lastNode.$prevNode ? history.lastNode.$prevNode.index : -1;
                        history.remove(history.lastNode);
                        if(index!=-1) {
                            this._switch(index);
                        }
                    }
                },

                /**
                 * 切换到所指定的面板
                 * @param flag {number|string} 若为数字，则为要切换面板的索引，若为字符串，则为一个筛选选择器。
                 * @return 返回切换相关信息
                 */
                _switch: function(flag) {
                    var index, panel;

                    if (typeof flag === 'number') {
                        index = flag;
                        panel = panels.eq(index);
                    }
                    else if (typeof flag === 'string') {
                        panel = panels.filter(flag);
                        index = panel;
                    }

                    if (index === self.currentIndex || !panel.length) {
                        return undefined;
                    }
                    else {
                        var switchInfo = {
                            index: index,
                            panel: panel,
                            panelName: panel.attr('name') || panel.attr('data-name'),
                            flag: flag
                        };

                        panel.show();
                        self.current && self.current.hide();
                        setCurrent(index, panel);

                        $scope.onSwitch && $scope.onSwitch( { $info: switchInfo } );

                        return switchInfo;
                    }
                }
            });

            // 初始化操作
            panels.hide();  // 默认将所有面板隐藏
            self.switch(0); // 默认显示第一个面板

            var deregisterInstance = cmSwitcherDelegate._registerInstance(self, $attrs.delegateHandle);

            $scope.$on('$destroy', function() {

                deregisterInstance();
            });

            /**
             * 设置当前面板
             * @param index {number} 需设置为当前面板的索引
             */
            function setCurrent(index, panel) {
                var length = self.length;

                if (0 <= index && index < length) {
                    self.currentIndex = index;
                    self.current = panel;
                    self.isFirst = index === 0;
                    self.isLast = index === length;
                    return true;
                }
                else {
                    return false;
                }
            }
        },

        compile: function(el, attrs) {
            var $el = $(el);
            $el.addClass('switcher');
        }
    };
});

angular.module('app.directives').service('cmSwitcherDelegate', ionic.DelegateService([
    'next',
    'prev',
    'getIsFirst',
    'getIsLast',
    'getCurrentIndex',
    'getLength',
    'switch',
    'backup'
]));
