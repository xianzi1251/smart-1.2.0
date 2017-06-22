/**
 * 提供常用的文本校验方法
 */
angular.module("app.services").factory("validator",function() {

	return {

		//是否为邮箱
		isEmail:function(text) {
			//邮箱正则
        	var emailReg=/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
        	return  emailReg.test(text);
		},
		//是否为手机
		isMobile:function(text) {
			//手机正则
        	var mobileReg = /^1[3|4|5|7|8][0-9]\d{8}$/i;
        	return mobileReg.test(text);
		}
	}
});
