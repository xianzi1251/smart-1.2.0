// 高德地图导航
angular.module('app.directives').directive('cmMap', function (
    toast, loading
) {

    var amapAPI = 'http://webapi.amap.com/maps?v=1.3&key=',
        amapIcon = 'resources/images/icon-map-location@2x.png';

    return {
        restrict: 'E',
        scope: true,
        link: function ($scope, $el, $attrs) {
            loading.open();
            var params = $scope.$eval($attrs.params);
            $el.attr('id', 'mapContent')
                .css('width', '100%')
                .css('height', '100%')
                .css('display', 'block')
                .css('z-index', '10');

            if (!window.AMap) {
                // $.getScript(amapAPI + APP_CONFIG.amapKey, function () {
                //     setTimeout(function () {
                //         init();
                //     }, 2000);
                // });
                $.ajax({
                    url: amapAPI + APP_CONFIG.amapKey,
                    type: "get",
                    dataType: "script",
                    timeout: 10000,
                    success: function (data, status) {
                        setTimeout(function () {
                            init();
                        }, 500);
                    },
                    error: function () {
                        loading.close();
                        toast.open('无法加载地图，请稍后再试');
                    }
                });
            } else {
                init();
            }

            function init() {
                setTimeout(function () {
                    
                    // 自定义位置图标
                    var icon = new AMap.Icon({
                        image: amapIcon,
                        size: new AMap.Size(50, 50),
                        imageSize: new AMap.Size(50, 50)
                    });

                    // 定义地图
                    var map = new AMap.Map('mapContent', params);
                    var marker = new AMap.Marker({
                        position: params.center,
                        map: map,
                        icon: icon,
                        offset : new AMap.Pixel(-25, -25)
                    });
                    
                    loading.close();
                });
            }
        }
    };
});
