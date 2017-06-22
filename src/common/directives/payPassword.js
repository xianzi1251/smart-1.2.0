/**
 * 支付密码输入指令
 */
angular.module('app.directives')
    .directive('cmPayPassword',function($timeout,$rootScope,messageCenter) {

        // 支付密码显示区域
        var template = '<div class="pay-password-input">';

        for(var i =1; i<=6; i ++) {
            var lastCls = i == 6 ? 'last-place': '';
            template += '<div class="pay-payssword-place '+ lastCls + ' fl">' +
            '<i class="icon-password icon ion-record hide"/></div>';
        }
        template += "</div>";

        // 支付密码键盘
        var keyboardTemplate = '<div class="pay-payssword-keyboard">' +
            '<div class="keyboard-line clearfix"><div class="keyboard-number fl">1</div>' +
            '<div class="keyboard-number fl">2</div>' +
            '<div class="keyboard-number fl">3</div></div>' +
            '<div class="keyboard-line clearfix"><div class="keyboard-number fl">4</div>' +
            '<div class="keyboard-number fl">5</div>' +
            '<div class="keyboard-number fl">6</div></div>' +
            '<div class="keyboard-line clearfix"><div class="keyboard-number fl">7</div>' +
            '<div class="keyboard-number fl">8</div>' +
            '<div class="keyboard-number fl">9</div></div>' +
            '<div class="keyboard-line clearfix"><div class="keyboard-number option fl"></div>' +
            '<div class="keyboard-number fl">0</div>' +
            '<div class="keyboard-number keyboard-backspace option fl"><i class="icon ion-backspace"></i></div></div>' +
            '</div>';

        return {
            restrict: 'E',
            replace: true,
            template: template,
            require: '?ngModel',
            link: function($scope, el, attrs,ngModel) {

                $scope.ngModel = ngModel;

                var keyboard = $(keyboardTemplate);

                var $icons = el.find('.icon-password');

                $('body').append(keyboard);

                // 定义一个数组 存放6位密码
                var payPassword = [];


                // 绑定数字区域点击事件
                keyboard.find('.keyboard-number').on('touchstart', function() {

                    $(this).addClass('active');
                    // 当前区域对应的数字文本
                    var number = $(this).text();

                    // 判断是否合法
                    if(number.length === 0 || payPassword.length >=6) {
                        return;
                    }
                    // 将当前数字放入数组
                    payPassword.push(number);

                    // 触发显示效果
                    togglePasswordPlace(payPassword.length);
                });

                // 移除active效果
                keyboard.find('.keyboard-number').on('touchend',function() {
                    var self = $(this);
                    setTimeout(function() {
                        self.removeClass('active');
                    },100);
                });

                // 回退按钮 鼠标按下事件
                keyboard.find('.keyboard-backspace').on('touchstart',function() {
                    if(payPassword.length > 0) {
                        $(this).addClass('option-active');
                        var index = payPassword.length - 1;
                        payPassword.splice(index,1);
                        togglePasswordPlace(payPassword.length);
                        ngModel.$setViewValue(payPassword.join(''));
                        $scope.$apply();
                    }
                });

                keyboard.find('.keyboard-backspace').on('touchend',function() {
                    var self = $(this);
                    setTimeout(function() {
                        self.removeClass('option-active');
                    },100);

                });

                // 支付密码显示*号处理
                function togglePasswordPlace(length) {
                    for(var i =0;i<$icons.length;i++) {
                        var icon = $($icons[i]);
                        if(length> i) {
                            icon.removeClass('hide');
                        }else{
                            icon.addClass('hide');
                        }
                    }

                    // 6位密码输入完成后 发起校验
                    if(length == 6) {
                        ngModel.$setViewValue(payPassword.join(''));
                        $scope.$apply();
                        $scope.$eval(attrs.verifyPayPassword);
                    }
                }
                $scope.$on('$destroy',function() {
                    $('.pay-payssword-keyboard').remove();
                });

                // 订阅键盘关闭消息
                messageCenter.subscribeMessage('keyboard.close',function() {
                    $('.pay-payssword-keyboard').remove();
                });

                // 订阅验证密码失败消息 清空输入框
                messageCenter.subscribeMessage('payPassword.clear',function() {
                    payPassword.splice(0,payPassword.length);
                    togglePasswordPlace(0);
                    ngModel.$setViewValue('');
                    $scope.$apply();
                });
            }
        };
    });
