/*
* 根据不同的平台来确定是否有清除缓存功能
* */
angular.module('app.directives').directive('cmClearCache',function(){

    return {
        restrict: 'EA',
        link: function ($scope, $el) {
            if(!window.cordova){
                $el.addClass('list-clear-cache');
            }
        }
    };
});