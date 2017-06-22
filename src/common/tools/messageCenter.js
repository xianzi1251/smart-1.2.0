/**
 * 消息中心，提供一个全消息注册及广播服务，作为各模块之间通信使用，可作为混入类混入 controller 中，
 * 当某一个事件发生后，可使用该消息中心向其它模块广播该消息。
 *
 * @example
 *
 * // 发布消息
 * messageCenter.publishMessage('login', { id: 5277, name: 'biossun' });
 *
 * // 订阅消息
 * messageCenter.subscribeMessage('login', function(event, userData) {
 *     // your codeing in this
 * }, $scope);
 *
 * // 将事件中心混入 controller （或 $scope） 中并订阅消息
 * angular.extend(controller, messageCenter, {
 *     init: function() {
 *         this.subscribeMessage('login', function(event, userData) {
 *             // your coding in this
 *         });
 *     }
 * });
 *
 * controller.init();
 */
angular.module('app.services').factory('messageCenter', function($rootScope) {
    return {
        /**
         * 发布消息
         * @param {String} msgName 消息名称
         * @param {String} data* 消息相关数据
         */
        publishMessage: function(msgName, data) {
            $rootScope.$emit(msgName, data);
        },

        /**
         * 订阅消息
         * @param {String|Array<String>} msgName 一个或多个消息名称
         * @param {Function} callback 回调函数
         * @param {Scope} scope 订阅该消息的作用域
         */
        subscribeMessage: function(messageNames, callback, $scope) {
            if (typeof messageNames === 'string') {
                messageNames = [messageNames];
            }

            if ( !($scope && $scope.$on) ) {
                if (this.$on) {
                    $scope = this;
                }
                else if (this.$scope) {
                    $scope = this.$scope;
                }
                else {
                    $scope = $rootScope;
                }
            }

            if ($scope.$$destroyed) {
                return;
            }

            var h = [];

            for (var i = 0; i < messageNames.length; i++) {
                h.push($rootScope.$on(messageNames[i], callback));
            }

            $scope.$on('$destroy', function() {
                for (var i = 0; i < h.length; i++) {
                    h[i]();
                }
            });
        }
    };
});
