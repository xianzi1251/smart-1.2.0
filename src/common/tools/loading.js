/**
 * 等待消息的提示框
 */
angular.module('app.services').factory('loading', function(
    toast
) {
    // var LOADING_ICON = '<ion-spinner icon="ios"></ion-spinner>';
    var CONTAINER_CLASS = 'loading-toast-container';
    var LOADING_ICON = '<div class="iconfont icon-loading"></div>';
    var loadingToast = new toast({ customClass: CONTAINER_CLASS });
    var _r_whitespace = /\s+/g;

    return {
        /**
         * 打开等待提示框
         */
        open: function(customOptions) {
            customOptions = loadingToast.processingOptions.apply(loadingToast, arguments);

            var template = angular.element('<div class="toast-loading"></div>');

            // add loading icon
            template.append('<div class="toast-loading-icon">' + LOADING_ICON + '</div>');

            // add text
            if (customOptions && customOptions.template) {
                template.append('<div class="toast-loading-text">' + customOptions.template + '</div>');
            }

            var customClass;

            if (customOptions && customOptions.customClass) {
                customClass = customOptions.customClass || '';
                customClass = ' ' + customClass.replace(_r_whitespace, ' ') + ' ';
                customClass = CONTAINER_CLASS + ' ' + customClass.replace(' ' + CONTAINER_CLASS + ' ', ' ');
            }
            else {
                customClass = CONTAINER_CLASS;
            }

            var loadingOptions = {
                template: template,
                position: 'center',
                offset: 0,
                duration: -1,
                penetrate: false,
                customClass: customClass
            };

            loadingToast.open(customOptions, loadingOptions);
        },

        /**
         * 关闭等待提示框
         */
        close: function() {
            loadingToast.close();
        }
    };
});
