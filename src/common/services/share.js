/**
 * 分享服务
 * 基于com.comall.umeng插件
 *
 */
angular.module('app.services').factory('shareService', function(
    api, loading, toast, errorHandling, userService, messageCenter
) {

    function getShareInfo(type, data) {
        var promise = api.get('/share/info', {
            type: type,
            data: data
        });
        promise.error(errorHandling);
        return promise;
    }

    // 事件营销去除失败提示
    function shareSuccess(type, data, platform) {
        
        if (userService.hasLogined()) {
            var promise = api.post('/share/success', {
                type: type,
                data: data,
                platform: platform
            });
            // promise.error(errorHandling);
            return promise;
        }
    }

    function share(data) {

        var deferred = api.defer();
        window.umeng.share(data.title, data.content, data.pic, data.url, function(platform) {
            deferred.resolve(platform);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function shareByType(type) {
        return function(id) {
            loading.open();
            return getShareInfo(type, id)
                .finally(function() {
                    loading.close();
                })
                .success(function(data) {

                    // 过滤html标签
                    data.content =  _.unescape(data.content).replace(/<p>/g, '').replace(/<[^<>]+>/g, '\n');

                    if (window.umeng && window.umeng.share) {
                        var deferred = api.defer();
                        share(data).then(function(platform) {
                            shareSuccess(type, id, platform)
                                .success(function () {

                                    // 广播分享成功/奖励成功消息
                                    messageCenter.publishMessage('share.success');
                                });

                            deferred.resolve();
                        }).error(function() {
                            deferred.reject();
                        });
                        return deferred.promise;
                    }
                });
        };
    }

    return {
        shareProduct: shareByType('product'),

        shareOrder: shareByType('order'),

        shareIntegralOrder: shareByType('integralOrder'),

        shareInvitation: shareByType('invitation'),

        shareArticle: shareByType('article'),

        shareSubsite: shareByType('subsite'),

        shareCommon: shareByType('common'),

        shareApp: shareByType('app'),

        shareIntegralIndex: shareByType('integralIndex'),

        shareCoupon: shareByType('coupon'),

        shareSuccess: shareSuccess,

        shareByType: shareByType
    };
});
