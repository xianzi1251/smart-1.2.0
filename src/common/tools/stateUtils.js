/**
 * 提供与路由状态相关的操作
 *
 */
angular.module('app.services').factory('stateUtils', function($state, tabs, states, nativeTransition, 
    toast, modals, userService, messageCenter, localStorage) {
    // 遍历 $state 中当前状态的视图，并将视图名称及相关数据传入回调函数，
    // 如果回调函数返回一个的值，则立即停止遍历，
    // 并将该值返回。
    function eachStateViews(callback) {
        var views = $state.current.views,
            result;

        if (!views) return undefined;

        _.forEach(views, function(data, name) {
            result = callback(name, data);
            return !result;
        });

        return result;
    }

    function getStateNameByCurrentTab(stateName) {

        var t = _.capitalize(stateName),
            stateNameForTab;

        stateNameForTab = eachStateViews(function(viewName) {
            var stateName = 'tabs.' + viewName + t;
            return states[stateName] ? stateName : undefined;
        });

        return stateNameForTab ? stateNameForTab : states[stateName] ? stateName : undefined;
    }

    return {
        /**
         * 用于获取在 statesForEveryTab 中定义的，并注册在当前 tab 项中的状态名称
         */
        getStateNameByCurrentTab: getStateNameByCurrentTab,

        // 跳转商品详情［视频／音频／文章］
        goProductInfo: function(entityName, genreName) {
            if (!entityName) return;
            
            var stateName = getStateNameByCurrentTab('productInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                entityName: entityName,
                genreName: genreName
            });
        },

        // 跳转套餐页
        goTeacherInfo: function(entityName) {
            if (!entityName) return;
            
            var stateName = getStateNameByCurrentTab('teacherInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                entityName: entityName
            });
        },

        // 跳转视频详情，如视频时间过期，则不能去播放页面；如无videoUrl，则不能播放
        goVideoInfo: function(entityName, videoUrl, isExpiry, genreName) {
            if (!videoUrl) return;

            if (!isExpiry) {
                var stateName = getStateNameByCurrentTab('videoInfo');
                nativeTransition.forward();
                $state.go(stateName, {
                    entityName: entityName,
                    videoUrl: videoUrl,
                    genreName: genreName
                });
            } else {
                toast.open('抱歉，视频已过期，请重新购买');
            }
        },

        // 跳转广告列表页
        goAdvList: function(positionName, title) {
            if (!positionName) return;

            var stateName = getStateNameByCurrentTab('advList');
            nativeTransition.forward();
            $state.go(stateName, {
                positionName: positionName,
                title: title
            });
        },

        // 跳转广告详情页
        goAdvInfo: function(id, from) {
            if (!id) return;

            var stateName = getStateNameByCurrentTab('advInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                id: id,
                from: from
            });
        },

        // 跳转电子书页
        goEBookInfo: function(id) {
            if (!id) return;

            var stateName = getStateNameByCurrentTab('eBookInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                id: id
            });
        },

        // 商城－商品详情
        goMallProductInfo: function(entityName) {
            if (!entityName) return;

            var stateName = getStateNameByCurrentTab('mallProductInfo');
            nativeTransition.forward();
            $state.go(stateName, {
                entityName: entityName
            });
        }

    };
});
