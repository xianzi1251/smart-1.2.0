/**
 * 设置订单列表页商品滑动容器宽度
 */

angular.module('app').directive('cmImageVerifyCode', function(
    globalService
) {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {
            var isLoading = false;

            loadImage();

            $element.on('click', loadImage);

            function loadImage() {
                if (isLoading) return;

                isLoading = true;
                globalService.imageVerifyCode().success(function(data) {
                    var base64Str = 'data:' + data.dataType + ';base64,' + data.base64;
                    $element.attr('src', base64Str);
                    isLoading = false;
                });
            }
        }
    };
})
;
