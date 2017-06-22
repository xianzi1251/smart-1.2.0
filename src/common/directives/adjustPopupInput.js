/**
 * popup input获取/失去焦点时（此时键盘弹出），该popup上移
 */
angular.module('app.directives').directive('cmAdjustPopupInput',function($timeout, $ionicConfig) {

        return {
            restrict: 'A',
            link: function($scope, $el, $attrs) {

                var $popupContainer = $el.parents('.popup-container'),
                    $popup = $el.parents('.popup');

                $popupContainer.addClass('popup-input-focus');

                // ios
                var overflowScroll = $ionicConfig.scrolling.jsScrolling();
                if (overflowScroll) {

                    // 获取焦点
                    $el.on('focus', function () {
                        setTimeout(function () {
                            $popup.css('top', '30%');
                        });
                    });

                    // 失去焦点
                    $el.on('blur', function () {
                        setTimeout(function () {
                            $popup.css('top', '50%');
                        });
                    });
                }
                 
            }
        };
    });
