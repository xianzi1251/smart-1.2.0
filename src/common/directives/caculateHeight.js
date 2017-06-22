/**
 * 体验店详情页的门店配送内容
 * 需要判断当前配送内容是否超过一行，如不超过一行，则不显示箭头；如超过一行，则显示箭头，并且点击后可展开内容。
 */

angular.module('app')
    .directive('cmCaculateHeight', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {

                $timeout(function () {

                    // 当前内容高度
                    var currentHeight = $el.height();

                    // 实际内容高度
                    var actualHeight = $el.find('.delivery-info').height();

                    // 判断是否展示icon并且是否可点击
                    if (currentHeight < actualHeight) {
                        $el.addClass('show-icon');

                        $el.on('click', function () {
                            $(this).toggleClass('show-more').toggleClass('show-less');
                        });
                    }

                }, 300);

            }
        };
    })
;
