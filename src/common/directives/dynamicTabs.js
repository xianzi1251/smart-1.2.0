/**
 * 选项卡头部导航组件
 */
(function() {
    var componentId = 0;
    var components = {};

    angular.module('app')
        .directive('cmDynamicTabs', function($rootScope, $ionicScrollDelegate, utils) {

            return {
                restrict: 'E',
                template:
                '<ion-scroll class="dynamic-tabs-scroll" direction="x" scrollbar-x="false" scrollbar-y="false">' +
                    '<div class="tabs-container" ng-transclude></div>' +
                '</ion-scroll>',
                scope: false,
                transclude: true,
                compile: function($el, $attrs) {
                    $el.addClass('dynamic-tabs');

                    var id = 'dynamic-tabs-scroll-' + componentId;
                    componentId++;
                    var $tabsScroll = $el.find('.dynamic-tabs-scroll').attr('delegate-handle', id);
                    var $container = $el.find('.tabs-container');

                    if ($attrs.fillMode === 'true') {
                        $tabsScroll.attr('has-bouncing', 'false');
                        $container.addClass('fill-mode');
                    }

                    var component = {
                        id: id,
                        $el: $el,
                        scrollFixed: $attrs.scrollFixed === 'true',
                        fixed: false,
                        // 切换 tab-item 是否充满容器
                        switchMode: function() {
                            if ($attrs.fillMode) {
                                return;
                            }
                            var width = 0;
                            var items = $container.find('.dynamic-tab-item');
                            items.each(function() {
                                width += this.getBoundingClientRect().width;
                            });
                            if (items.length && $container.width() + 1 > width) {
                                $container.addClass('fill-mode');
                            } else {
                                $container.removeClass('fill-mode');
                            }
                        }
                    };

                    components[id] = component;

                    return {
                        post: function postLink($scope, $el, $attrs) {
                            $scope.$on('$destroy', function() {
                                delete components[id];
                            });

                            setTimeout(function () {
                                component.switchMode();
                            });

                            component.enableFixed = function() {
                                var top = 0;
                                var marginTop = component.$scrollPanel.css('margin-top');
                                if (component.headerShrink) {
                                    top = ionic.Platform.isIOS() && ionic.Platform.isWebView() ? 20 : 0;
                                } else {
                                    top = component.$scrollPanel.css('top');
                                }
                                $tabsScroll.css({
                                    'top': top,
                                    'margin-top': marginTop
                                }).appendTo($view);
                                this.fixed = true;
                            };

                            component.disableFixed = function() {
                                $tabsScroll.css({
                                    'top': 0,
                                    'margin-top': 0
                                }).appendTo($el);
                                this.fixed = false;
                            };

                            if (component.scrollFixed) {
                                var $view = $el.closest('ion-view');
                                component.$scrollPanel = $el.closest('.ionic-scroll');
                                component.headerShrink = component.$scrollPanel[0].hasAttribute('cm-header-shrink') &&
                                    !component.$scrollPanel.hasClass('overflow-scroll');
                                component.$scrollPanel.on('scroll', ionic.throttle(function(e) {
                                    var scrollTop = 0;
                                    var event = e.originalEvent;
                                    if (event.detail && event.detail.scrollTop) {
                                        scrollTop = event.detail.scrollTop;
                                    } else {
                                        scrollTop = event.target.scrollTop;
                                    }
                                    component.headerShrink = component.headerShrink && 
                                            $view.find('.download-banner.ng-hide').length>0;

                                    var starty = utils.getElementRect($el, true).offsetTop +
                                        (component.headerShrink ? 44 : 0);
                                

                                    if (!component.fixed && scrollTop > starty) {
                                        component.enableFixed();
                                    }
                                    if (component.fixed && scrollTop <= starty) {
                                        component.disableFixed();
                                    }
                                }, 100));
                            }
                        }
                    };
                }
            };
        })

    .directive('cmDynamicTabItem', function($ionicScrollDelegate) { 
        return {
            restrict: 'E',
            template:
            '<image class="tab-item-tag tab-item-tag-{{::tagPosition}}" ' +
                'cm-lazyload="tagImage" ng-if="tagPosition" />' +
            '<div class="tab-item-text">{{tabText}}</div>',
            scope: {
                tabText: '=',
                tagImage: '=',
                tagPosition: '='
            },
            link: function($scope, $el, $attrs) {
                $el.addClass('dynamic-tab-item');
                var $container = $el.closest('.tabs-container');

                var id = $el.closest('.dynamic-tabs-scroll').attr('delegate-handle');
                var component = components[id];
                var tabsScrollHandle = $ionicScrollDelegate.$getByHandle(id);

                if ($scope.$parent.$last === true) {
                    setTimeout(function() {
                        component.switchMode($container);
                    });
                }

                $el.on('click', function() {
                    var offsetLeft = ionic.DomUtil.getPositionInParent($el[0]).left;
                    var scrollOffset = offsetLeft + $el.outerWidth() / 2 - $container.width() / 2;
                    tabsScrollHandle.scrollTo(scrollOffset, 0, true);
                });

                var anchorTarget = $attrs.anchorTarget;
                if (anchorTarget && component.scrollFixed) {
                    var panelScrollHandle = $ionicScrollDelegate
                        .$getByHandle(component.$scrollPanel.attr('delegate-handle'));

                    if (anchorTarget == '$self') {
                        $el.on('anchorScroll', function() {
                            setTimeout(function() {
                                var offsetTop = ionic.DomUtil.getPositionInParent(component.$el[0]).top +
                                    (component.headerShrink ? 44 : 0);
                                if (offsetTop < panelScrollHandle.getScrollPosition().top) {
                                    panelScrollHandle.scrollTo(0, offsetTop + 1, false);
                                }
                            });
                        });
                    } else {
                        $el.on('click', function() {
                            var $anchorTarget = $('#' + anchorTarget);
                            if ($anchorTarget.length) {
                                offsetTop = ionic.DomUtil.getPositionInParent($anchorTarget[0]).top +
                                    (component.headerShrink ? 44 : 0) - component.$el.height();
                                panelScrollHandle.scrollTo(0, offsetTop, true);
                            }
                        });
                    }
                }
            }
        };
    });

})();
