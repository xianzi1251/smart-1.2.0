angular.module('app.controllers').controller('feedbackCtrl', function(
    $scope, api, nativeTransition, $state, userService, toast, errorHandling
) {

    var ctrl = this;

    _.assign(ctrl, {
        $scope: $scope,

        content: '',

        contact: '',

        // 提交订单
        submit: function () {

            if (!ctrl.content) {
                toast.open('请填写您的意见和建议');
                return;
            } else if (!ctrl.contact) {
                toast.open('请填写您的联系方式');
                return;
            } else {
                userService.submitFeedback(ctrl.contact, ctrl.content)
                    .success(function() {
                        toast.open('感谢您的意见反馈');
                        nativeTransition.forward();
                        $state.go('tabs.user');
                    })
                    .error(errorHandling);
            }
        }

    });

});
