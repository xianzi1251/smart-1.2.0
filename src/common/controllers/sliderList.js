angular.module('app.controllers').controller('sliderListCtrl', function(
    $scope, indexService, loadDataMixin, errorHandling, userService, modals, toast, messageCenter
) {

    var ctrl = this;

    var positionName = {
        sliderList: '1482765752195'
    };

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,
        
        // slider初始化
        sliderOptions: {
            loop: false,
            initialSlide: 1,
            pagination: false,
            effect: 'coverflow',
            centeredSlides: true,
            observer: true,
            // 阻止click冒泡。拖动Swiper时阻止click事件。
            preventClicksPropagation: true,
            // 设置为true则swiping时点击slide会过渡到这个slide。
            slideToClickedSlide: true,
            slidesPerView: 1.39,
            coverflow: {
                rotate: 0,
                stretch: -40 * $(window).width() / 320,
                depth: 250,
                modifier: 1,
                slideShadows: false
            }
        },

        // 初始化首页数据
        loadData: function() {
            return indexService.getIndexInfo(positionName.sliderList)
                .success(function(response) {
                    if (response.list && response.list[0]) {

                        ctrl.sliderList = response.list[0];

                        _.forEach(ctrl.sliderList, function(slider) {
                            slider.picUrl = window.APP_CONFIG.serviceAPI + slider.newPicUrl;

                            // 转义返回的文描html
                            slider.content = _.unescape(slider.content);
                        });
                    }
                });
        },

        // 点赞
        likes: function(advId) {

            userService.hasLogined()
                .success(function() {
                    indexService.userLike(advId)
                        .success(function(response) {
                            toast.open(response.object.info);
                        })
                        .error(errorHandling);
                })
                .error(function() {
                    modals.login.open();
                });         
        }

    });

    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        deregistration();
    });

    // 订阅提交[点赞成功]消息 刷新列表
    messageCenter.subscribeMessage('like.success', function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});
