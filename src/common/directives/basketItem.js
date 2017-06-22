/**
 * 购物篮项组件
 */

angular.module('app')
    .directive('cmBasketItem', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/basketItemContent.html',
            scope: false,
            replace: true
        };
    })

    .directive('cmInvalidBasketItem', function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/modules/invalidBasketItemContent.html',
            scope: false,
            replace: true
        };
    });
