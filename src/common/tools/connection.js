angular.module('app.services').factory('connection',function(toast,modals) {

    return {

        // 是否连接网络
        isNormalConnection: function() {
            if(navigator.connection) {
                var networkState = navigator.connection.type;
                return networkState != Connection.NONE;
            }
            return true;
        },
        // 初始化网络状态监听
        initListener: function() {

            // document.addEventListener("offline", function() {
            //     modals.networkAnomaly.open({
            //         backdropClickToClose: false,
            //         hardwareBackButtonClose: false
            //     });
            // }, false);

            document.addEventListener("online", function() {
                modals.networkAnomaly.close();
            }, false);
        }
    };
});
