/**
 * 验证是否是有效的中国手机号码
 */
angular.module('app.directives').directive('cmvMobile', function factory() {
    var regexp = /^1\d{10}$/i;

    return {
        restrict: 'A',
        require: 'ngModel',

        link: function($scope, $el, $attrs, m) {
            m.$validators.mobile = function(mval) {
                return m.$isEmpty(mval) ? true : regexp.test(mval);
            };
        }
    };
});
