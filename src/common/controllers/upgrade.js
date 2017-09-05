angular.module('app.controllers').controller('upgradeCtrl',function(
    modals
) {

    var ctrl = this;
    _.assign(ctrl, {

        // 关闭新手导航弹层
        closeModel: function() {
            modals.upgrade.close();

            setTimeout(function() {
                modals.startEvent.open();
            });

        }
    });
});
