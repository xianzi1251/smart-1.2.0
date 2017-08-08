/**
 * 结算相关modal弹层bug修复
 * 去除页面跳转、键盘弹出、收起引起的bug
 */

angular.module('app')
    .directive('cmResizeHeight', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope) {

	            // 修复ios手机没有安装支付宝APP时app调用支付宝wap引起弹层全屏bug
			    if (window.cordova && ionic.Platform.isIOS()) {
			        window.addEventListener('resize', resizeHeight);

			        $scope.$on('modal.hidden', function(){
			            // 弹层关闭时移除事件绑定
			            window.removeEventListener('resize', resizeHeight);
			        });
			    }

			    // 修复安卓手机微信结算相关弹层顶起无法滚动(wap端也存在)
			    if (!window.cordova && ionic.Platform.isAndroid()) {
			        window.addEventListener('resize', resizeHeight);

			        $scope.$on('modal.hidden', function(){
			            // 弹层关闭时移除事件绑定
			            window.removeEventListener('resize', resizeHeight);
			        });
			    }

			    function resizeHeight(){
			        // 键盘关闭、开启时重新获取页面高度
			        var resizeHeight = window.innerHeight;
			        var modalBody = angular.element('body');
			        modalBody.css('height',resizeHeight);

			        if (modalBody.hasClass('keyboard-open')) {
			            modalBody.removeClass('keyboard-open');
			        }
			    }
            }
        };
    })
;
