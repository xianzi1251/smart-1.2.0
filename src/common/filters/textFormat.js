/**
 * 增加一个文本过滤器 用于替换隐藏字符
 * 传入的文本是手机 则中间4位以*号替换
 *   18612943151 -> 186****3151
 * 传入的文本是邮箱 则@之前部分除第一位最后一位外使用*替换
 *   qq9133702@163.com -> q*******2@163.com
 */
angular.module('app.filters').filter('textFormat', function(validator) {

    return function(text,anonymously) {
        //去除空格
        text = $.trim(text);

        //判断是否为邮箱
        var isEmail = validator.isEmail(text);
        //判断是否为手机
        var isMobile = validator.isMobile(text);
        if(isMobile) {
            text=text.substring(0,3)+"****"+text.substring(7);
        }else if(isEmail) {
            var emailTextArray = text.split('@');
            var emailPart = emailTextArray[0];
            if(emailPart.length>2) {
                var replaceLength = emailPart.length -2;
                if(replaceLength > 0) {
                    var replaceChar="";
                    for(var i=0;i<replaceLength;i++) {
                        replaceChar+="*";
                    }
                    text = emailPart.substring(0,1) + replaceChar + emailPart.substring(emailPart.length-1) +"@"+emailTextArray[1];
                }
            }
        }
        // 匿名处理
        if(anonymously && text) {
            if(text.length > 2) {
                text = text.substring(0,1) +
                text.substring(1,text.length - 1).replace(/./g,'*') +
                text.substring(text.length -1);
            }else {
                text = '**';
            }
        }
        return text;
    };
});
