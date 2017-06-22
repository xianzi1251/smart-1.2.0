/**
 * 计数器
 */
angular.module('app.directives')
    .directive('cmCounter', function factory() {
        return {
            restrict: 'EA',

            template: [
                '<button class="counter-dec counter-transparent" type="button">-</button>',
                '<input class="counter-num counter-transparent" id="{{inputId}}" name="{{inputName}}" type="text" value="{{ngModel.$viewValue}}" disabled />',
                '<button class="counter-inc counter-transparent" type="button">+</button>',
            ].join(''),

            scope: {
                inputName: '@',
                inputId: '@',
                delayTriggerChange: '@',
                maxNum: '=',
                minNum: '=',
                onChange: '&'
            },

            require: 'ngModel',

            link: function($scope, el, attrs, ngModel) {
                $scope.ngModel = ngModel;

                var input = el.find('> .counter-num'),
                    decBtn = el.find('> .counter-dec'),
                    incBtn = el.find('> .counter-inc'),

                    prevValue = ngModel.$viewValue,

                    changeTimeout;

                el.addClass('counter').removeAttr('name');

                decBtn.on('click', function() {
                    ngModel.$setViewValue(Math.max(ngModel.$viewValue - 1, getMinNum()));
                    refresh();
                    $scope.$apply();
                });
                incBtn.on('click', function() {
                    ngModel.$setViewValue(Math.min(ngModel.$viewValue + 1, getMaxNum()));
                    refresh();
                    $scope.$apply();
                });

                ngModel.$viewChangeListeners.push(function() {
                    if (prevValue !== ngModel.$viewValue) {
                        triggerChange();
                    }
                });

                ngModel.$render = function() {
                    prevValue = ngModel.$viewValue;
                    refresh();
                };

                $scope.$watch('minNum', function() {
                    refresh();
                });

                $scope.$watch('maxNum', function() {
                    refresh();
                });

                function triggerChange() {
                    if ($scope.delayTriggerChange) {
                        clearTimeout(changeTimeout);
                        changeTimeout = setTimeout(function() {
                            changeTimeout = undefined;
                            runChange();
                        }, parseInt($scope.delayTriggerChange) || 400);
                    }
                    else { runChange(); }
                }

                function runChange() {
                    if (prevValue == ngModel.$viewValue) { return; }

                    var prev = prevValue;
                    prevValue = ngModel.$viewValue;

                    var promise = $scope.onChange({
                        $newNumber: ngModel.$viewValue,
                        $oldNumber: prev
                    });

                    if (!$scope.$$phase && !$scope.$root.$$phase) {
                        $scope.$apply();
                    }

                    // 如果事件处理函数返回一个 promise，则处理该 promise 的错误状态，
                    // 当出现错误时，回退到修改之前的值，且此次回退不会再次触发修改事件。
                    if (promise) {
                        promise.catch(function(data) {
                            prevValue = prev;
                            ngModel.$setViewValue(prevValue);
                            throw data;
                        });
                    }
                }

                function refresh() {
                    if (ngModel.$isEmpty(ngModel.$viewValue)) { return; }

                    var minNum = getMinNum(),
                        maxNum = getMaxNum(),
                        isMin = ngModel.$viewValue <= minNum,
                        isMax = ngModel.$viewValue >= maxNum;

                    if (minNum > maxNum) {
                        throw '最小值不能大于最大值';
                    }

                    decBtn.toggleClass('disabled', isMin).prop('disabled', isMin);
                    incBtn.toggleClass('disabled', isMax).prop('disabled', isMax);

                    ngModel.$setViewValue(Math.min(Math.max(minNum, ngModel.$viewValue), maxNum));
                }

                function getMinNum() {
                    var minNum = parseInt($scope.minNum, 10);
                    return angular.isNumber(minNum) && !isNaN(minNum) ? minNum : -Infinity;
                }

                function getMaxNum() {
                    var maxNum = parseInt($scope.maxNum, 10);
                    return angular.isNumber(maxNum) && !isNaN(maxNum) ? maxNum : Infinity;
                }
            }
        };
    });
