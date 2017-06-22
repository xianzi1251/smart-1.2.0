/**
 * 把秒转化为时分秒格式
 */
angular.module('app.filters').filter('secondsFormat', function(validator) {
    return function(value, type) {
        var s = parseInt(value / 1000);
        var m = 0;
        var h = 0;
        if (s > 60) {
            m = parseInt(s / 60);
            s = parseInt(s % 60);
            if (m > 60) {
                h = parseInt(m / 60);
                m = parseInt(m % 60);
            }
        }
        var result = [];
        if (h < 10) h = "0" + h;
        if (m < 10) m = "0" + m;
        if (s < 10) s = "0" + s;

        switch (type) {
            case 'h':
                return h;
            case 'm':
                return m;
            case 's':
                return s;
            default:
                result.push(h, m, s);
                return result.join(":");
        }
    };
});
