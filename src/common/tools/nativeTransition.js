 /**
 * 封装全局通用业务操作
 */
angular.module('app.services').factory('nativeTransition',function(
    $ionicPlatform, $rootScope
){
    var transition;

    var options = {
        duration: 200,
        delay: -1,
        slowdownfactor: 4
    };

    var animating = false;

    $ionicPlatform.ready(function() {
        if (ionic.Platform.isAndroid() && window.plugins && window.plugins.nativepagetransitions) {
            transition = window.plugins.nativepagetransitions;
            transition.globalOptions.duration = options.duration;
            transition.globalOptions.iosdelay = options.delay;
            transition.globalOptions.androiddelay = options.delay;
            transition.globalOptions.slowdownfactor = options.slowdownfactor;
            transition.globalOptions.fixedPixelsTop = 0;
            transition.globalOptions.fixedPixelsBottom = 0;
        }
    });

    function nativeSlide(direction) {
        setTimeout(function () {
            transition.slide({direction:direction}, angular.noop, angular.noop);
            animating = true;
            var deregistration = $rootScope.$on('$ionicView.afterLeave', function() {
                setTimeout(function () {
                    transition.executePendingTransition(angular.noop, angular.noop);
                    setTimeout(function () {
                        animating = false;
                    }, options.duration);
                }, 200);
                deregistration();
            });
        });
    }


    return {
        /**
         * 页面前进动画
         */
        forward: function() {
            if (!transition) {
                return;
            }
            nativeSlide('left');
        },

        /**
         * 页面后退动画
         */
        backward: function() {
            if (!transition) {
                return;
            }
            nativeSlide('right');
        },

        /**
         * 获取切换动画总时长
         */
        isAnimating: function() {
            return animating;
        }
    };
});
