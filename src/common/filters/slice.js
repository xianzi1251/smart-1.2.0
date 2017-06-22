/**
 * 封装数组及字符串的 slice 方法
 */
angular.module('app.filters').filter('slice', function() {
    return function(input, begin, end) {
        return (input && input.slice) ? input.slice(begin, end) : input;
    };
});
