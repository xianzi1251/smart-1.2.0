/**
 * 截取文字并添加省略号
 */
angular.module('app.filters').filter('splitText', function() {
    return function(input, length) {
        return input.length > length ? (input.substring(0,length) + '...' ) : input;
    };
});
