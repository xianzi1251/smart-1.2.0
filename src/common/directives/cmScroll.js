/**
 * 商品介绍时展开和收起处理
 */
angular.module('app.directives').directive('cmScroll', function factory($ionicScrollDelegate, $timeout) {

    // 是否收起更多
    var hideMore = true;

    var $content1 = $ionicScrollDelegate.$getByHandle('productInfoScroll'),
        $content2 = $ionicScrollDelegate.$getByHandle('courseVideoScroll');

    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $el, $attrs) {

            // 操作元素隐藏显示
            showMoreOption($el);

            // 添加展开、收起点击事件
            $('.describe-btn').on('click',function() {
                // 修改状态
                hideMore = !hideMore;
                // 操作元素隐藏显示
                showMoreOption($el);
            });
        }
    };

    /**
     * 隐藏、显示元素
     */
    function showMoreOption(el) {

        var $infolist = el.find('.describe-content'),
            $infoBtn = el.find('.describe-btn');

        if (hideMore) {
            $infoBtn.text('查看更多内容');
            $infolist.addClass('max-list');
        } else {
            $infoBtn.text('收起内容');
            if($infolist.hasClass('max-list')) {
                $infolist.removeClass('max-list');
            }
            $infolist.offset().top;
        }

        $content1.resize();
        $content2.resize();
    }
});
