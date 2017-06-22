/**
 * resize、scroll等频繁触发页面回流的操作要进行函数节流
 * fn               Function        需要节流的方法
 * delay            Integer         方法调用延迟，在延迟内的重复调用会清除前一次调用
 * mustRunDelay     Integer         初次调用延迟多少毫秒后方法必定被调用
 */

 angular.module('app.services').factory('throttle', function(
     $ionicPopup, $translate
 ) {
     return {
         // 生成包装方法
         createHandler: function throttle(fn, delay, mustRunDelay){
             var timer = null,
                 start = null;
             return function() {
                 var context = this,
                     current = +new Date(),
                     _arguments = arguments;
                 clearTimeout(timer);

                 if(!start){
                     start = current;
                 }
                 if(current - start >= mustRunDelay){
                     fn.apply(context, _arguments);
                     start = current;
                 }
                 else {
                     timer = setTimeout(function() {
                         fn.apply(context, _arguments);
                         start = null;
                     }, delay);
                 }
             };
         }
     };
 });
