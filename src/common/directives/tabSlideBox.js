/*
 * SimplePubSub from https://github.com/mbenford/ngTagsInput/blob/master/src/util.js
 * 改的已经基本和上面那个没关系了_(:з」∠)_
 * */

angular.module('tabSlideBox', [])
    .directive('onTabFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngTabRepeatFinished');
                    });
                }
            }
        };
    })
    .directive('tabSlideBox', ['$timeout', '$ionicSlideBoxDelegate', '$ionicScrollDelegate',
        function ($timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
            return {
                restrict: 'A, E, C',

                link: function(scope,element,attr) {
                    var width =  document.body.clientWidth / 5 ;
                    $('#tab-slide-box-style').remove();
                    var style = '<style type="text/css" id="tab-slide-box-style">.tabSlideBox-item { width: '+width+'px}</style>';
                    $('body').append($(style));
                },

                controller: function ($scope, $attrs, $element) {

                    // Handle multiple slide/scroll boxes
                    var handle = $element.find('.slider').attr('delegate-handle');

                    var ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
                    if (handle) {
                        ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(handle);
                    }

                    var ionicScrollDelegate = $ionicScrollDelegate;
                    if (handle) {
                        ionicScrollDelegate = ionicScrollDelegate.$getByHandle(handle);
                    }

                    function initialization() {
                        var $wrap = $element.find(".tabSlideBox-wrap"),
                            $items = $wrap.find(".tabSlideBox-item");
                        angular.forEach($items, function (value, key) {
                            var item = angular.element(value);
                            item.on('click', function () {
                                ionicSlideBoxDelegate.slide(key);
                            });
                        });
                        $timeout(function () {
                            ionicSlideBoxDelegate.slide($scope.$eval($attrs.tsbCurrentTab) || 0, 1);
                            $timeout(function () {
                                $wrap.addClass("initComplete");
                            }, 500);
                        }, 0);
                        // console.debug('initialization complete');
                    }

                    /**
                     * 把目标元素顶到容器中间，并附加.active
                     */
                    function setPosition(index) {

                        var $container = $element.find(".tabSlideBox-container"),
                            $wrap = $container.find(".tabSlideBox-wrap"),
                            $items = $wrap.find(".tabSlideBox-item");

                        var middlePosition = $container[0].offsetWidth / 2;
                        var targetElement = $items[index];
                        var $currentElement = $container.find(".active");
                        if (targetElement) {
                            var targetElementWidth = targetElement.offsetWidth,
                                targetElementLeft = targetElement.offsetLeft;

                            $currentElement.removeClass("active");
                            angular.element(targetElement).addClass("active");

                            var leftOffset = (middlePosition - (targetElementLeft) - targetElementWidth / 2) + "px";
                            $wrap[0].style[ionic.CSS.TRANSFORM] = "translate3d(" + leftOffset + ",0,0)";
                        }
                    }

                    $scope.onSlideChanged = function (index) {
                        // console.debug("onSlideChanged");
                        setPosition(index);
                    };

                    $scope.$on('ngTabRepeatFinished', function (ngTabRepeatFinishedEvent) {
                        //  console.debug("ngTabRepeatFinished");
                        setPosition($scope.$eval($attrs.tsbCurrentTab) || 0);
                        initialization();
                    });
                }
            };

        }
    ]);
