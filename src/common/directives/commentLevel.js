/**
 * 评价等级展示指令
 * @param level (?)  评论等级  取值范围1-5  传入该参数时 为不可编辑状态
 */
angular.module('app.directives').directive('cmCommentLevel',function() {

        // 默认为最高等级
        var defaultLevel = 5;

        var template = '<div class="comment-level">';

        for(var i = 0; i < 5; i ++) {
            template += '<i class="iconfont icon-star"></i>';
        }
        template += '</div>';
        return {
            restrict: 'E',
            replace: true,
            template: template,
            require: '?ngModel',
            link: function($scope, el, attrs,ngModel) {

                $scope.ngModel = ngModel;

                // 获取传入的评论等级
                var level = attrs.level;

                // 评论星级数组
                var icons = el.find('i');

                if(!level) {
                    // 默认最高等级
                    toggleIcon(defaultLevel,icons);
                    icons.on('click',function() {
                        level = $(this).prevAll().length + 1;
                        toggleIcon(level,icons);
                        ngModel.$setViewValue(level);
                        $scope.$apply();
                    });
                }else{
                    toggleIcon(level,icons);
                }

                function toggleIcon(level,icons) {
                    for(var i =0 ;i< icons.length;i++) {
                        var icon = $(icons[i]);
                        if(i < level) {
                            icon.addClass('icon-on');
                        }else {
                            icon.removeClass('icon-on');
                        }
                    }
                }
            }
        };
    });
