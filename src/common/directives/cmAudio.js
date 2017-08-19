
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
                    var $audioControl = $el.find('.audio-left');
                    var $totalTime = $el.find('#totalTime');
                    var $playedTime = $el.find('#playedTime');
                    var $range = $el.find('.range');
                    var $icon = $el.find('.icon');

                    var totalTime = 0;

                    // 音频时间
                    $('#audio').on('loadedmetadata',function () {
                        totalTime = parseInt(this.duration);
                        $totalTime.text(timeToStr(this.duration));
                    }); 

                    // 暂停／播放事件
                    $audioControl.on('click', function($event) {
                        $event.stopPropagation();

                        var time;

                        if ($myAudio.paused) {
                            $myAudio.play();
                            $icon.addClass('ion-ios-pause').removeClass('ion-ios-play');

                            time = setInterval(function(){
                                var t = parseInt($myAudio.currentTime);
                                $range.attr({'max': totalTime}).val(t);
                                $playedTime.text(timeToStr(t));
                            }, 1000);

                        } else {
                            $myAudio.pause(); 
                            $icon.addClass('ion-ios-play').removeClass('ion-ios-pause');

                            clearInterval(time);
                        }

                    });

                    // 转换音频时长显示
                    function timeToStr(time) {
                        var m = 0,
                        s = 0,
                        _m = '00',
                        _s = '00';
                        time = Math.floor(time % 3600);
                        m = Math.floor(time / 60);
                        s = Math.floor(time % 60);
                        _s = s < 10 ? '0' + s : s + '';
                        _m = m < 10 ? '0' + m : m + '';
                        return _m + ':' + _s;
                    }

                    // 监听播放完成
                    $myAudio.addEventListener('ended', audioEnded, false);

                    // 播放完成
                    function audioEnded() {
                        $myAudio.currentTime = 0;
                        $myAudio.pause();
                        $icon.addClass('ion-ios-play').removeClass('ion-ios-pause');
                    }

                    //监听滑块，可以拖动
                    $range.on('change', function() {
                       $myAudio.currentTime = this.value;
                       $range.val(this.value);
                    });

                }); 
            }
        };
    })
;
