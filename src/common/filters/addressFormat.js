/**
 * 用于格式化用户的详细地址 ，接口传回的收货地址以特殊字符分割，前端需要替换为模板显示
 *
 */
angular.module('app.filters').filter('addressFormat',function() {

	return function(address) {

		if(!address) {
			return;
		}
		//详细地址模板
		var addressPartTpl=['路','号/弄','小区','号/幢','室'];

		var addressStr="";

		//判断参数类型
		var isStr  = typeof(address)=='object';

		if(!isStr) {
			//分割详细地址
			var addressArr = address.split('%$');
			if(addressArr.length == addressPartTpl.length) {
				for(var i in addressArr) {
					addressStr+= addressArr[i]+""+addressPartTpl[i];
				}
	        }else {
	        	addressStr = address;
	        }
		}else {
			var index = 0;
			addressStr = address.road + addressPartTpl[index++] + address.lane +
                 addressPartTpl[index++] + address.village +  addressPartTpl[index++] +
				 address.buildingNumber +  addressPartTpl[index++] + address.roomNumber + addressPartTpl[index++];
		}
       return addressStr;
	};
});
