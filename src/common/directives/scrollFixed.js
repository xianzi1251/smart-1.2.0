/**
 * 滚动到元素高度时将元素设置为在视口顶部浮动
 * 3.0.0版本隐藏修改ios状态栏颜色的插件
 */
angular.module('app.directives')

.directive('cmScrollFixd', function($rootScope, $document, $ionicScrollDelegate, $timeout, utils) {

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attr) {

            $timeout(function () {

                var headerHeight = 0,
                    barHeight = $('.bar-header').css('height');

                if (barHeight) {
                    headerHeight = + barHeight.slice(0, -2);
                }

                var starty = utils.getElementRect($element).offsetTop;

                var scrollPanel = $element.parents('.ionic-scroll').eq(0);
                starty += headerHeight;

                if (ionic.Platform.isIOS() && ionic.Platform.isWebView()) {
                    starty -= 20;
                }

                // console.log(starty);
                // console.log('*****************');

                $element.wrap(document.createElement('div')).css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    width: '100%'
                });

                var container = $element.parent().css({
                    position: 'relative',
                    height: $element.height()
                });

                var view = $element.parents('ion-view').eq(0);

                var fixed = false;

                scrollPanel.on('scroll', function(e) {
                    var scrollTop = 0;
                    var event = e.originalEvent;
                    if (event.detail && event.detail.scrollTop) {
                        scrollTop = event.detail.scrollTop;
                    } else {
                        scrollTop = event.target.scrollTop;
                    }

                    if (!fixed && scrollTop > starty) {
                        if (headerHeight > 44) {
                            $element.css('height', ($element.height() + headerHeight - 44) + 'px');
                            $element.css('padding-top', (headerHeight - 44) + 'px');
                        }
                        // 留出下载条的高度
                        if($rootScope.hasDownloadBanner) {
                            $element.css('margin-top','35px');
                        }
                        $element.appendTo(view);
                        fixed = true;
                        // switchStatusBarDefault();
                    }
                    if (fixed && scrollTop <= starty) {
                        if (headerHeight > 44) {
                            $element.css('height', '');
                            $element.css('padding-top', '');
                        }
                        $element.css('margin-top','0px');
                        $element.appendTo(container);
                        fixed = false;
                        // switchStatusBarLight();
                    }
                });

                /*function switchStatusBarDefault() {
                    if (window.StatusBar) {
                        StatusBar.styleDefault();
                    }
                }

                function switchStatusBarLight() {
                    if (window.StatusBar) {
                        StatusBar.styleLightContent();
                    }
                }

                var scope = $scope.$parent.$parent;
                scope.$on('$ionicView.beforeEnter', function(event, info) {
                    if (fixed) {
                        var deregistration = $scope.$on('$stateChangeSuccess', function(event, info) {
                            if (info.name == 'tabs.index') {
                                switchStatusBarDefault();
                            }
                            deregistration();
                        });
                    }
                });

                scope.$on('$ionicView.beforeLeave', function(event, info) {
                    if (fixed) {
                        switchStatusBarLight();
                    }
                });*/
            }, 300);
        }
    };
});
