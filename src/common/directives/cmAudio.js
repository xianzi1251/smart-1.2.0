
/**
 * 音频播放
 */

angular.module('app.directives').directive('cmAudio', function(
    
) {
    return {
            restrict: 'A',
            scope: false,
            link: function($scope, $el, $attrs) {
                setTimeout(function() {
                    var $myAudio = $el.find('#audio').get(0);
                    var $audioControl = $el.find('#audio-main');
                    var $totalTime = $el.find('#totalTime');
                    var $playedTime = $el.find('#playedTime');
                    var $progress = $el.find('.progress');
                    var $icon = $el.find('.icon');

                    // 暂停／播放事件
                    $audioControl.on('click', function($event) {
                        $event.stopPropagation();

                        if ($myAudio.paused) {
                            $myAudio.play();
                            $icon.addClass('ion-ios-play').removeClass('ion-ios-pause');
                        } else {
                            $myAudio.pause(); 
                            $icon.addClass('ion-ios-pause').removeClass('ion-ios-play');
                        }

                    });

                    // 音频时间
                    $('#audio').on('loadedmetadata',function () {
                       $totalTime.text(transTime(this.duration));
                    }); 

                    // 转换音频时长显示
                    function transTime(time) {
                        var duration = parseInt(time);
                        var minute = parseInt(duration/60);
                        var sec = duration%60+'';
                        var isM0 = ':';
                        if(minute == 0){
                            minute = '00';
                        }else if(minute < 10 ){
                            minute = '0'+minute;
                        }
                        if(sec.length == 1){
                            sec = '0'+sec;
                        }
                        return minute + isM0 + sec;
                    }

                    // 监听进度条
                    $myAudio.addEventListener('timeupdate', updateProgress, false);

                    // 更新进度条
                    function updateProgress() {
                        var value = Math.round((Math.floor($myAudio.currentTime) / Math.floor($myAudio.duration)) * 100, 0);
                        $progress.css('width', value + '%');
                        $playedTime.html(transTime(audio.currentTime));
                    }

                    // 监听播放完成
                    $myAudio.addEventListener('ended', audioEnded, false);

                    // 播放完成
                    function audioEnded() {
                        $myAudio.currentTime = 0;
                        $myAudio.pause();
                        $icon.addClass('ion-ios-pause').removeClass('ion-ios-play');
                    }

                }); 
            }
        };
    })
;
