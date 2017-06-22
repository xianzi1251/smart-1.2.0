/**
 * input 数字校验
 * 去除非数字字符
 */
angular.module('app.directives').directive('cmAjustNumberData',function() {

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function($scope, $element, $attrs, ngModel) {

                $scope.ngModel = ngModel;

                var maxLength = $attrs.cmAjustNumberData || 11;

                $element.on('input', function() {
                    handleInputData();
                });

                function handleInputData() {
                    var handleData,
                        val = $element.val();

                    if (val) {
                        handleData = val.replace(/[^0-9]/g, '').substring(0, maxLength);
                        $element.val(handleData);
                        ngModel.$setViewValue(handleData);
                        $scope.$apply();
                    }
                }
            }
        };
    });
