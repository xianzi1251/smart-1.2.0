angular.module('app.controllers').controller('shoppingCartCtrl', function(
    $scope, api, modals, errorHandling, loading, cartService, messageCenter,
    loadDataMixin, toast, popup, stateUtils, nativeTransition, $state
) {

    var ctrl = this;

    // 购物车中基本所有操作在运行时都要屏蔽用户操作。
    // 因此这里提供一个包装器，用其包装后的操作方法，可以在操作执行前开启一个 loading 控件，
    // 并在操作结束后关闭它。
    function wrapper(fun) {
        return function() {
            loading.open();
            ctrl.loading = true;
            var promise = fun.apply(this, arguments);

            if (promise && promise.finally) {
                promise.finally(function() { loading.close(); ctrl.loading = false;});
            }

            return promise;
        };
    }

    _.assign(ctrl, loadDataMixin, {
        $scope: $scope,

        // 跳转商品详情
        goProductInfo: stateUtils.goProductInfo,

        /**
         * 操作模式：
         * 1. 选购模式
         * 2. 编辑模式
         */
        mode: 1,

        // 是否全选
        cartSelected: true,

        // 购物车项数量
        cartItemNumber: 0,

        // 已选择的商品数量
        selectedAmount: 0,

        // 已选择的商品价格
        selectedPrice: 0,

        // 加载购物车数据
        loadData: function() {
            return cartService.info()
                .success(function(response) {

                    ctrl.data = response;

                    if (_.isEmpty(ctrl.data)) {

                        ctrl.data.items = [];

                    } else {

                        // 总计的商品价格和数量
                        var count = 0;
                        var price = 0;

                        // 绝对路径图片
                        _.forEach(ctrl.data.items, function(item) {
                            item.sku.picUrl = window.APP_CONFIG.serviceAPI + item.sku.picUrl;
                            item.selected = true;
                            count += item.quantity;
                            price += (item.quantity * item.sku.prices.offerPrice.price);
                        });

                        ctrl.mode = 1;

                        // 默认全选
                        ctrl.cartSelected = true;

                        // 当前购物车项数量
                        ctrl.cartItemNumber = ctrl.data.items.length;

                        // 已选择的商品数量
                        ctrl.selectedAmount = count;

                        // 已选择的商品价格
                        ctrl.selectedPrice = price;
                    }

                });
        },

        /** 切换编辑功能 */
        toggleEditMode: function() {

            if (this.mode !== 2) {
                this.mode = 2;

                // 在进入编辑模式时，进行必要的初始化操作
                // 将所有的主购物项的编辑状态下的选中模式改为未选中状态
                _.forEach(ctrl.data.items, function(item) {
                    item.selected = false;
                });

                // 默认非全选
                ctrl.cartSelected = false;

                // 已选择的商品数量
                ctrl.selectedAmount = 0;

                // 已选择的商品价格
                ctrl.selectedPrice = 0;

            }
            else {
                // TODO: 这里要返回到上一个模式
                this.mode = 1;

                // 总计的商品价格和数量
                var count = 0;
                var price = 0;

                // 全选
                _.forEach(ctrl.data.items, function(item) {
                    item.selected = true;
                    count += item.quantity;
                    price += (item.quantity * item.sku.prices.offerPrice.price);
                });

                // 全选
                ctrl.cartSelected = true;

                // 已选择的商品数量
                ctrl.selectedAmount = count;

                // 已选择的商品价格
                ctrl.selectedPrice = price;
            }
        },

        // 全选／非全选
        changeCartSelected: function() {

            if (ctrl.cartSelected) {

                // 总计的商品价格和数量
                var count = 0;
                var price = 0;

                // 全选
                _.forEach(ctrl.data.items, function(item) {
                    item.selected = true;
                    count += item.quantity;
                    price += (item.quantity * item.sku.prices.offerPrice.price);
                });

                // 已选择的商品数量
                ctrl.selectedAmount = count;

                // 已选择的商品价格
                ctrl.selectedPrice = price;
            } else {
                // 全选
                _.forEach(ctrl.data.items, function(item) {
                    item.selected = false;
                });

                // 已选择的商品数量
                ctrl.selectedAmount = 0;

                // 已选择的商品价格
                ctrl.selectedPrice = 0;
            }
        },

        /** 修改购物项的选中状态 */
        changeItemSelected: function(index) {

            // 总计的商品价格／数量／当前选中的购物项数量
            var price = 0;
            var count = 0;
            var selectedNumber = 0;

            // 查看已选择的商品数量 & 查看已选择的商品价格
            _.forEach(ctrl.data.items, function(item) {
                if (item.selected) {
                    selectedNumber++;
                    count += item.quantity;
                    price += (item.quantity * item.sku.prices.offerPrice.price);
                }
            });

            ctrl.selectedAmount = count;
            ctrl.selectedPrice = price;

            // 检验是否为全选
            if (ctrl.cartItemNumber == selectedNumber) {
                ctrl.cartSelected = true;
            } else {
                ctrl.cartSelected = false;
            }
        },

        // 修改商品数量
        changeNumber: function(item) {
            loading.open();

            cartService.changeNumber(item.id, item.quantity)
                .error(errorHandling)
                .finally(function() {
                    loading.close();
                });
        },

        // 删除商品
        deleteItem: function() {

            if (ctrl.selectedAmount == 0) {
                toast.open('请选择需要删除的商品');
                return;
            }

            // 已选中的商品id
            var itemsId = '';

            // 查看已选择的商品
            _.forEach(ctrl.data.items, function(item) {
                if (item.selected) {
                    itemsId += item.id + ',';
                }
            });

            popup.confirm('提示', '确定要删除这 ' + ctrl.selectedAmount + ' 件商品吗？')
                .then(function(res) {
                    if(res) {
                        cartService.deleteItem(itemsId)
                            .success(function() {
                                toast.open('删除成功');
                            })
                            .error(errorHandling);
                    }
                });
        },

        // 提交
        submit: function() {
            // 已选中的商品id
            var itemsId = '';

            // 查看已选择的商品
            _.forEach(ctrl.data.items, function(item) {
                if (item.selected) {
                    itemsId += item.id + ',';
                }
            });

            modals.checkout.open({
                params: {
                    ordItemIds: itemsId
                }
            });
        }









        /** 修改全选的选中状态 */
        // changeBasketSelected: wrapper(function(basket) {
        //     if (basket.selected) {
        //         return cartService.selectAll(basket.id)
        //             .error(errorHandling);
        //     }
        //     else {
        //         return cartService.unselectAll(basket.id)
        //             .error(errorHandling);
        //     }
        // })
    });

    // 加载购物车信息
    var deregistration = $scope.$on('$ionicView.afterEnter', function() {
        ctrl.init();
        ctrl.mode = 1;
        deregistration();
    });

    // 订阅提交[订单成功/加入购物车／删除购物车/登录]消息 刷新列表
    messageCenter.subscribeMessage(['checkout.success', 'cart.add', 'cart.delete', 'login'], function() {
        ctrl.refresh({showLoading: false, emptyData: false});
    });

});
