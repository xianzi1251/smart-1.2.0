angular.module('app.services').factory('unique',function(
    localStorage
) {

    if (window.device) {
        return window.device.platform.toLowerCase() + '-' + window.device.uuid;
    }
    else {
        var unique = localStorage.get('unique');

        if (unique) {
            return unique;
        }
        else {
            unique = createUnique();
            localStorage.set('unique', unique);
            return unique;
        }
    }

    // 创建一个标识码
    function createUnique() {
        var now = new Date();

        return 'custom-'
            + now.getFullYear()
            + fill((now.getMonth() + 1), 2)
            + fill(now.getDate(), 2)
            + fill(now.getHours(), 2)
            + fill(now.getMinutes(), 2)
            + fill(now.getSeconds(), 2)
            + fill(now.getMilliseconds(), 3)
            + Math.random().toFixed(20).substring(2);  // 20 位随机码
    }

    // 将所传入的数字转换为字符串，若字符串的长度小于所指定的长度，则在起始位置以数字 「0」 补足长度。
    // 最多支持 5 位补足长度。
    function fill(number, length) {
        var str = number.toString(),
            filler = '00000';

        if (str.length < length) {
            str = filler.substring(0, length - str.length) + str;
        }

        return str;
    }
});
