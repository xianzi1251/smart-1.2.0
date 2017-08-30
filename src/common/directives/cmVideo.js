
/**
 * 视频播放
 */

angular.module('app.directives').directive('cmVideo', function() {
    return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {

                $scope.$watch($attrs.cmVideo, initVideo);

                // 刷新状态
                function initVideo() {

                    // 清除之前的播放视频
                    $el.html('');

                    // 视频url
                    var videoUrl = $scope.$eval($attrs.cmVideo);

                    var $video = $('<video ishivideo="true" isrotate="true" src="' + videoUrl + '"></video>').appendTo($el);

                    hivideo($video[0]);
                    
                }
            }
        };
    })
;
