/**
 * 本地提醒指令，只有mobile环境下才会显示。
 * 点击按钮可以开启、关闭本地提醒，
 * cm-show  <Boolean>  是否显示按钮 默认显示 false , 此次会检测属性值变动
 * count-down , 抢购倒计时 毫秒
 * count-ahead , 抢购前 N 毫秒不提醒
 * product-id , 商品id
 * event-id , 抢购id
 * product-name , 商品名称
 */
angular.module('app.directives')

.directive('cmNotification', function(toast, $translate, localNotification) {
    return {
        restrict: 'E',
        template: [
            '<button class="button button-primary remind" type="button">提醒我</button>',
            '<button class="button button-primary button-primary-reverse unremind" type="button">取消提醒</button>',
        ].join(''),
        link: function($scope, $element, $attr) {
            if (!window.cordova) { //wxshop、wap环境下不做处理
                $element.empty();
                return;
            }

            $element.addClass('notification');

            var remindBtn = $element.find('.remind');
            var unremindBtn = $element.find('.unremind');
            var ahead = $scope.$eval($attr.countAhead) || 0; //提前 N 分钟不提醒
            var productId = $scope.$eval($attr.productId);
            var eventId = $scope.$eval($attr.eventId);
            var productName = $attr.productName;

            //提醒我click
            $element.on('click', '.remind', function(event) {
                event.stopPropagation();
                var countDown = $scope.$eval($attr.countDown);
                countDown = countDown - ahead;

                if (countDown > 0) {
                    remindBtn.hide();
                    unremindBtn.show();
                    localNotification.schedule(productId, productName, eventId, countDown);
                } else {
                    toast.open($translate.instant('flashSale.message.remind'));
                }
            });

            //取消提醒click
            $element.on('click', '.unremind', function(event) {
                event.stopPropagation();

                remindBtn.show();
                unremindBtn.hide();

                localNotification.cancel(productId, eventId);
            });

            //刷新状态
            function refresh() {
                var isShow = $scope.$eval($attr.cmShow); //是否显示
                if (!isShow) {
                    remindBtn.hide();
                    unremindBtn.hide();
                    return;
                }
                //是否开启抢购，
                //如果false 则显示抢购提醒，如果true,则显示取消提醒
                var isScheduled = localNotification.isScheduled(productId, eventId);
                if (isScheduled) { //如果开启提醒
                    unremindBtn.show();
                    remindBtn.hide();
                } else { //没有开启提醒
                    remindBtn.show();
                    unremindBtn.hide();
                }
            }

            $scope.$watch($attr.cmShow, refresh);
        }
    };
});
