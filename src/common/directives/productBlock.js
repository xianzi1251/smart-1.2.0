/**
 * 商品瀑布流
 */
angular.module('app.directives')
    .directive('cmProductBlock', function factory() {
        return {
            restrict: 'EA',

            templateUrl: 'templates/modules/productBlock.html',

            scope: {
                showComment: '@',
                adjustOffset: '@',
                cmProductBlock: '=',
                clickHandler: '=',
                addToCartHandler: '='
            },

            link: function($scope, $element, $attr) {
                $element.addClass('product-block');
                $scope.showComment = !!$scope.showComment;
                $scope.adjustOffset = !!$scope.adjustOffset;
                $scope.columns = [[], []];
                var items = $scope.cmProductBlock;
                var columns = $scope.columns;
                var blockLength = 0;
                $scope.$watch(function() {
                        return items.length;
                    }, function(newValue, oldValue) {
                        for (var i = blockLength; i < newValue; i++) {
                            columns[i%2].push(items[i]);
                            blockLength++;
                        }
                    });

                // 设置瀑布流偏移
                if ($scope.adjustOffset) {
                    setTimeout(function () {
                        var offsets = [];
                        var prevBlock = $element.prev();
                        if (prevBlock.hasClass('product-block')) {
                            prevBlock.children().each(function(i) {
                                var offset = $(this).data('offset');
                                var $column = $element.children().eq(i).css('margin-top', offset);
                                offsets.push(offset);
                            });
                        }
                        $element.children().each(function(i) {
                            var offset = (offsets[i] || 0) + this.getBoundingClientRect().height - $element[0].getBoundingClientRect().height;
                            $(this).data('offset', offset);
                        });
                    }, 0);
                }
            }
        };
    });
