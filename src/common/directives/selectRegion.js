/**
 * 实现选择收货地区功能
 */
angular.module('app.directives').directive('cmSelectRegion', function factory() {

    // 格式化地区名称为如下格式：
    //   中国，北京，昌平区
    function formatRegionsName(regions) {
        var name = "";

        _.forEach(regions, function(region) {
            name += region.label;
        });

        return name;
    }

    return {
        restrict: 'A',
        require: '?ngModel',

        link: function($scope, $el, $attrs, ngModel) {
            if (!ngModel) return;

            $el.on('click', function() {
                openSelectModal();
            });

            $el.next().on('click', function() {
                openSelectModal();
            });

            function openSelectModal() {
                $scope.modals.selectAddressRegion.open({
                    params: {
                        successCallback: (function(regionId, regions) {
                            ngModel.$setViewValue(regions);
                            ngModel.$render();
                            $scope.$eval($attrs.ngChange);
                        }).bind(this),
                        regions: ngModel.$modelValue
                    }
                });
            }

            ngModel.$formatters = [];
            ngModel.$viewChangeListeners = [];

            ngModel.$render = function() {
                $el.val(formatRegionsName(ngModel.$modelValue));
            };
        }
    };
});
