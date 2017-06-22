/**
 * 表单组
 */
angular.module('app.directives').directive('cmItemFormGroup', function factory($timeout) {

    return {
        require: '^form',
        priority: 700,
        link: function($scope, $el, $attrs, formCtrl) {
            $timeout(function() {
                var input = $el.find('.input-field'),
                    helpBlock = $el.find('.mini-help-block'),

                    name = input.attr('name'),
                    first = true;

                if (!name || !formCtrl[name]) { return; }

                input.focus(function(e) {
                    getHelpBlockText().removeClass('ng-hide');
                });

                input.blur(function(e) {
                    getHelpBlockText().addClass('ng-hide');
                    first = false;
                });

                helpBlock.click(function(e) {
                    getHelpBlockText().toggleClass('ng-hide');
                    e.stopImmediatePropagation();
                    e.preventDefault();
                });

                function getHelpBlockText() {
                    return $el.find('.mini-help-block .text').addClass('ng-hide-animate');
                }

                // 监听表单校验的结果，如果校验成功，为表单项添加表示成功或失败的 class。
                var listener = $scope.$watch(function() {
                    return formCtrl[name].$valid ? 'success' : formCtrl[name].$invalid ? 'danger' : '';
                }, function (newStateClass, oldStateClass) {
                    $el.removeClass(oldStateClass).addClass(newStateClass);
                });

                // 监听表单域改变，刷新帮助信息的显示状态。
                input.one('blur', function (e) {
                    helpBlock.toggleClass('ng-hide');
                });

                $scope.$on('$destroy', function() {
                    listener();
                });
            });
        }
    };
});
