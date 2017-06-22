angular.module('app.directives').directive('cmWapPay', function factory(toast,modals,messageCenter) {
    return function($scope, $el, $attrs) {

        var payInfo = $.parseJSON($attrs.payInfo);

        var button = $el.parent().find('button');

        var _fnCallBack = function() {
            try {
                var url = this.contentWindow.location.href;
                if (/.*\/paysuccess/.test(url)) {

                    if (button.length) {
                        // 焦点移到隐藏的button
                        button[0].focus();
                    }

                    // 关闭支付弹层
                    modals.aliWapPay.close();

                    //广播支付成功消息
                    messageCenter.publishMessage('pay.success',payInfo);
                }
                if (/.*\/payerror/.test(url)) {
                    modals.aliWapPay.close();
                    toast.open('支付出现异常，请稍后重试~')
                }
            } catch (e){
                console.log('e.stack ======= ' + e.stack);
            }

        };

        var payIframe = document.createElement('iframe');
        payIframe.width = '100%';
        payIframe.height = '100%';
        payIframe.id = 'payIframe';
        payIframe.src = payInfo.payUrl;
        payIframe.addEventListener('load', _fnCallBack);
        $($el).html(payIframe);
    };
});
