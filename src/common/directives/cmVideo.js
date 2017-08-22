
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

                    // 视频url
                    var videoUrl = $scope.$eval($attrs.cmVideo);

                    var $video = document.getElementById('video');
                    $video.setAttribute('src', videoUrl);

                    hivideo($video);
                }
            }
        };
    })
;
