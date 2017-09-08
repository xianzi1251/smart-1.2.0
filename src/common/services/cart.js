angular.module('app.services').factory('cartService', function(
    $rootScope, api, messageCenter, utils, userService, modals
) {

    var cartService = {
        initPromise: undefined,
        refreshPromise: undefined,

        /**
         * 购物车数据
         */
        data: undefined,

        /**
         * 购物车初始化
         */
        init: function() {
            var self = this;

            this.initPromise = this.info()
                .success(function(data) {
                    self.data = data;

                    // 当用户登录登出时，会修改购物车内容，此时需要刷新购物车
                    messageCenter.subscribeMessage('login', function() {
                        self.refresh();
                    }, $rootScope);

                    messageCenter.subscribeMessage('logout', function() {
                        self.refresh();
                    }, $rootScope);

                    messageCenter.publishMessage('cart.init', self.data);
                })
            .finally(function(data) {
                self.initPromise = undefined;
            });

            return this.initPromise;
        },

        /**
         * 刷新购物车数据
         */
        refresh: function() {
            var self = this;

            // 如果已完成购物车数据初始化
            if (self.data) {
                // 取消已经在执行的刷新操作
                if (self.refreshPromise) {
                    self.refreshPromise.cancel();
                }

                // 并开启一个新的刷新操作
                messageCenter.publishMessage('cart.refreshBefore');
                self.refreshPromise = self.info()
                    .then(function(response) {
                        utils.empty(self.data);
                        _.merge(self.data, response.data);
                        messageCenter.publishMessage('cart.refresh', self.data);
                        return response;
                    })
                    .finally(function() {
                        self.refreshPromise = undefined;
                    });

                return self.refreshPromise;
            }

            // 如果还未完成数据初始化操作，则执行初始化操作
            else {
                if (self.initPromise) {
                    return self.initPromise;
                }
                else {
                    return self.init();
                }
            }
        },

        /**
         * 获取购物车信息
         */
        info: function() {
            return api.post('/cosmos.json?command=config.order', {
                    proName: 'shoppingCart',
                    cart: true,
                    userId: window.APP_USER.id
                });
        },

        /**
         * 修改购物车中商品数量
         */
        changeNumber: function(id, number) {
            return api.post('/cosmos.json?domain=scommerce&command=SC_ORD_CART_UPDATE_ACTION21', {
                    proName: 'SC_ORD_CART_UPDATE_ACTION21',
                    orderItemId: id,
                    nums: number
                });
        },

        /**
         * 加入购物车
         */
        addToCart: function(sku) {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_CART_ADD_ACTION21', {
                    proName: 'BYT_ORD_CART_ADD_ACTION21',
                    userId: window.APP_USER.id,
                    sku: sku,
                    nums: 1
                });
        },

        /**
         * 购物车中删除商品
         */
        deleteItem: function(orderItemId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_CART_DELETE_ACTION', {
                    proName: 'BYT_ORD_CART_DELETE_ACTION',
                    orderItemId: orderItemId
                })
                .success(function() {
                    messageCenter.publishMessage('cart.delete');
                });
        }

    };

    return cartService;
});
