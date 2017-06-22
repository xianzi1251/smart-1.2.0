/**
 * 根据不同的平台来区分应用原生分享或微信/wap浏览器自带分享
 * share-data:              分享data
 * share-type：             分享类型
 */

angular.module('app.directives').directive('cmShare', function(
    shareService
) {
    return {
        restrict: 'A',
        link: function($scope, $el, $attrs) {

            // 隐藏按钮
            $el.css({'visibility': 'hidden'});

            // 需分享的数据及类型
            var shareType = $attrs.shareType,
                shareTypeCommon = 'common',
                shareData = $scope.$eval($attrs.shareData);

            if (window.umeng && window.umeng.share) {

                // 显示分享按钮 
                $el.css({'visibility': 'visible'});

                // 添加click事件
                $el.on('click', function () {
                    shareService.shareByType(shareType)(shareData);
                });

            } else if (window.wx) {

                // 进入页面时，分享为独立的分享
                $scope.$on('$ionicView.afterEnter', function() {
                    shareWxshopEnter(shareType, shareData);
                })

                // 离开页面时，重置分享为common
                $scope.$on('$ionicView.afterLeave', function() {
                    shareWxshopLeave(shareTypeCommon);
                });

            }

            // 微信分享，独立分享
            function shareWxshopEnter(shareType, shareData) {

                shareService.shareByType(shareType)(shareData).success(function (data) {

                    var title = data.title,
                        desc = data.content,
                        imgUrl = data.pic,
                        link = data.url,
                        type = shareType,
                        id = shareData;

                    // 分享至微信好友
                    wx.onMenuShareAppMessage({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () {
                            shareService.shareSuccess(type, id, 'wxsession');
                        }
                    });

                    // 分享至朋友圈
                    wx.onMenuShareTimeline({
                        title: title,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () {
                            shareService.shareSuccess(type, id, 'wxtimeline');
                        }
                    });

                    // 分享至QQ
                    wx.onMenuShareQQ({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () {
                            shareService.shareSuccess(type, id, 'qq');
                        }
                    });

                    // 分享到微博
                    wx.onMenuShareWeibo({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () { 
                           shareService.shareSuccess(type, id, 'sina');
                        }
                    });

                    // 分享至QQ空间
                    wx.onMenuShareQZone({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () { 
                           shareService.shareSuccess(type, id, 'qzone');
                        }
                    });

                });
            }

            // 微信分享，公共分享
            function shareWxshopLeave(shareType) {

                shareService.shareByType(shareType)().success(function (data) {
                    var title = data.title,
                        desc = data.content,
                        imgUrl = data.pic,
                        link = data.url,
                        type = shareType,
                        id;

                    // 分享至微信好友
                    wx.onMenuShareAppMessage({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () {
                            shareService.shareSuccess(type, id, 'wxsession');
                        }
                    });

                    // 分享至朋友圈
                    wx.onMenuShareTimeline({
                        title: title,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () {
                            shareService.shareSuccess(type, id, 'wxtimeline');
                        }
                    });

                    // 分享至QQ
                    wx.onMenuShareQQ({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () {
                            shareService.shareSuccess(type, id, 'qq');
                        }
                    });

                    // 分享到微博
                    wx.onMenuShareWeibo({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () { 
                           shareService.shareSuccess(type, id, 'sina');
                        }
                    });

                    // 分享至QQ空间
                    wx.onMenuShareQZone({
                        title: title,
                        desc: desc,
                        link: link,
                        imgUrl: imgUrl,
                        success: function () { 
                           shareService.shareSuccess(type, id, 'qzone');
                        }
                    });

                });
            }
        }
    };
})
;
