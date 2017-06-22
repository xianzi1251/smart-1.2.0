
/**
 * 视频播放
 */

angular.module('app.directives').directive('cmVideo', function(
    
) {
    return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {
                setTimeout(function() {

                    // 视频url
                    var videoUrl = $scope.$eval($attrs.cmVideo);

                    var options = {
                        rtmp: videoUrl,
                        flv: videoUrl ,
                        m3u8_hd: videoUrl,
                        coverpic: '',
                        autoplay: false,
                        live: false,
                        width: '100%',
                        height: '100%',
                        listener: function (msg) {}
                    };

                    var player = new TcPlayer('video-container', options);

                }, 200);
            }
        };
    })
;
