/**
 * 时间显示过滤器  日期和时间部分增加br
 */
angular.module('app.filters').filter('timeFormat', function() {

    return function(time) {
        if(time) {
            var timeArray = time.split(' ');
            return timeArray[0] +"<br>"+ timeArray[1];
        }
        return time;

    };
});
