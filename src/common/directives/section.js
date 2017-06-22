angular.module('app.directives')
    .controller('cmSectionCtrl', cmSectionCtrl)

    .directive('cmSection', cmSection)
    .directive('cmSectionItem', cmSectionItem)
    .directive('cmSectionNav', cmSectionNav);

cmSectionCtrl.$inject = "$scope, $element, $attrs".split(",");

function cmSectionCtrl($scope, $element, $attrs) {

    var ctrl = this;

    // 所有需要计算的元素的数据
    var sectionItemData = {};

    var currentCountListener = null;
    var scrollStopListener = null;

    angular.extend(ctrl, {

        $scope: $scope,

        // 总层数
        totalCount: 0,

        // 保存版块中元素的数据
        setSectionItem: function (id, sectionRulePage, sectionItemIndex, sectionItemBottom) {

            var sectionItemCurrent;

            sectionItemIndex++;
            var i = sectionItemIndex % sectionRulePage ? Math.ceil(sectionItemIndex / sectionRulePage) : sectionItemIndex / sectionRulePage;


            var sectionItem = {
                sectionItemCurrent : i,
                sectionItemBottom : sectionItemBottom
            };

            if (sectionItemData[id]) {

                if (!sectionItemData[id][i-1]) {
                    sectionItemData[id][i-1] = sectionItem;
                    return;
                }

                if (sectionItemData[id][i-1].sectionItemBottom <= sectionItemBottom) {
                    sectionItemData[id][i-1] = sectionItem;
                }

                return;
            } else {
                sectionItemData[id] = [];
                sectionItemData[id][i-1] = sectionItem;
            }
        },

        // 根据版块id移除下面所有元素
        removeSectionItem: function(id) {
            if(sectionItemData[id]) delete sectionItemData[id];
        },

        // 根据高度获取当前层数
        getCurrentCount: function(scrollTop) {

            var i, j, sectionItem, result,
                sectionItemCurrent = 0,
                sectionTotal = 0,
                find = false;

            for (i in sectionItemData) {

                sectionItem = sectionItemData[i];

                for (j = 0; j < sectionItem.length; j++) {

                    if (scrollTop > sectionItem[j].sectionItemBottom) {
                        sectionItemCurrent = sectionItem[j].sectionItemCurrent;
                    } else {
                        find = true;
                        break;
                    }
                }

                if (find) break;

                sectionItemCurrent = 0;
                sectionTotal += sectionItem.length;
            }

            if (sectionTotal >= this.totalCount) {
                result = sectionTotal;
            } else {
                result = sectionTotal + sectionItemCurrent;
            }

            if (currentCountListener) {
                currentCountListener(result);
            }
        },

        // 添加滚动监听
        addScrollHandler: function (scrollPanel, ionicContentHeight) {
            var self = this;
            var scrollTopData;
            // 滚动处理
            var scrollHandler = function(e) {

                clearTimeout(timer);

                var scrollTop = 0;
                var event = e.originalEvent;
                if (event.detail && event.detail.scrollTop) {
                    scrollTop = event.detail.scrollTop;
                } else {
                    scrollTop = event.target.scrollTop;
                }
                var timer = setTimeout(function() {
                    if (scrollTopData === scrollTop && scrollStopListener) {
                        scrollStopListener();
                    }
                }, 300);

                scrollTopData = scrollTop;

                self.getCurrentCount(scrollTop + ionicContentHeight);
            };

            scrollPanel.on('scroll', ionic.throttle(scrollHandler, 100));
        },
        addCurrentCountListener: function(listener) {
            currentCountListener = listener;
        },
        addScrollStopListener: function(listener) {
            scrollStopListener = listener;
        }
    });
}

/**
 * [初始化当前section指令]
 * @param  {[type]} $rootScope [description]
 * @return {[type]}            [description]
 */
function cmSection() {
    return {
        restrict: 'A',
        controller: 'cmSectionCtrl',
        scope: {
            totalCount: '=?'
        },
        link: link
    };

    function link($scope, $el, $attrs, sectionCtrl) {
        $scope.$watch('totalCount', function(newValue, oldValue) {
            sectionCtrl.totalCount = newValue;
        });

        setTimeout(function() {
            var scrollContent = $el.children('.scroll-content').eq(0);

            var rect = scrollContent[0].getBoundingClientRect();

            sectionCtrl.addScrollHandler(scrollContent, rect.height);

        }, 0);

    }
}

/**
 * [版块元素指令]
 */
cmSectionItem.$inject = "utils".split(",");
function cmSectionItem(utils) {
    return {
        restrict: 'A',
        require: '^^cmSection',
        link: link
    };

    function link($scope, $el, $attrs, sectionCtrl) {

        if ($scope.$$destroyed || !$el.is(':visible')) return;

        var key = $scope.$eval($attrs.cmSectionItem);

        setTimeout(function() {

            if ($scope.$$destroyed) return;

            var rect = utils.getElementRect($el);
            var offsetBottom = rect.offsetTop + rect.height;

            sectionCtrl.setSectionItem(key, $attrs.ruleCount, $scope.$index, offsetBottom);

        });

        destroyHandler();

        function destroyHandler() {
            $scope.$on('$destroy', function() {
                sectionCtrl.removeSectionItem(key);
            });
        }
    }
}


cmSectionNav.$inject = "$ionicScrollDelegate".split(",");
function cmSectionNav($ionicScrollDelegate) {
    return {
        restrict: 'E',
        template: '<div class="section-nav button button-small button-stick"' +
                    'ng-click="scrollTop()">' +
                        '<div class="section-count">' +
                            '<span class="count current-count"></span>' +
                            '<span class="count total-count"></span>' +
                        '</div>' +
                        '<i class="section-icon icon cm-icon icon-stick"></i>' +
                    '</div>',
        replace: true,
        require: '^^cmSection',
        link: function($scope, $el, $attrs, sectionCtrl) {
            var targetScroll = $attrs.targetScroll;
            $scope.scrollTop = function() {
                var handle = $ionicScrollDelegate.$getByHandle(targetScroll);
                handle.scrollTo(0, 0, true);
            };

            var $currentCount = $el.find('.current-count');
            var currentCount = 0;
            sectionCtrl.addCurrentCountListener(function(data) {
                if (data < 1) {
                    $el.removeClass('scrolling');
                    return;
                }
                $el.addClass('scrolling');
                if (currentCount !== data) {
                    currentCount = data;
                    $currentCount.text(currentCount);
                }
            });

            sectionCtrl.addScrollStopListener(function() {
                $el.removeClass('scrolling');
            });

            var $totalCount = $el.find('.total-count');
            $scope.$watch(function() {
                    return sectionCtrl.totalCount;
                }, function(newValue, oldValue) {
                    $totalCount.text(newValue);
                });
        }
    };
}
