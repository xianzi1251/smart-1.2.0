
/**
 * 视频播放
 */

angular.module('app.directives').directive('cmVideo', function(
    
) {
    return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {

                $scope.$watch($attrs.cmVideo, initVideo);

                // 刷新状态
                function initVideo() {

                    // 移除之前的视频
                    $el.html('');

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
                        x5_type: 'h5',
                        x5_fullscreen: 'false',
                        listener: function (msg) {}
                    };

                    var player = new TcPlayer('video-container', options);

                } 
            }
        };
    })
;
