/**
 * 一个通用的数据加载混入模块，支持分页功能。
 *
 * 所混入的目标对象中应提供一个 loadData 方法用于加载所需数据，
 * 而如果需要支持分页，则请提供一个 loadPage 方法；如果 loadData 及 loadPage 同时存在，则优先使用 loadPage 方法。
 *
 * 无论 loadData 还是 loadPage，都应在调用后返回一个 promise 对象。
 * 其中，loadPage 需要接收两个参数：pageIndex 及 itemsPerPage，
 * pageIndex 表示需要加载的分页的页码（第一页为 1），而 itemsPerPage 表示分页的大小（默认为 10）；
 * 同时，loadPage 方法应保证所返回的数据中具有如下几个属性：
 *
 *   {
 *       totalItems: 总条目数，Integer
 *       pageIndex: 所返回分页的页码，第一页为 1，Integer
 *       items: 分页数据，Array
 *   }
 *
 * 另外，loadData 及 loadPage 都可接收一个额外的参数：attrs。
 * 该参数为一个配置对象，用于为加载操作提供一些数据。
 *
 * 最后，如果该混入模块所混入的对象不是 $scope，则该对象中需要提供一个 $scope 属性。
 *
 *
 * ## 加载事件
 *
 * 可以在被混入对象中提供一个 loadBefore 方法，该方法会在每一次进行数据加载之前执行，如果该方法返回 false，
 * 则取消加载。
 *
 * 对应的，还可以提供一个 loadAfter 方法，该方法会在数据加载完成并将其放到 data 属性中之后被执行，
 * 可以在该方法中进行一些后续的处理操作。
 *
 * 以上两个方法在被执行时都可以接收一个 configs 参数，其值为进行加载操作时的设置对象。
 *
 *
 * ## abort
 *
 * loadDataMixin 有可能会抛弃当前已发出的请求，比如在数据加载中时执行了 clear 方法。
 * 当请求被抛弃时，promise 会切换为 reject 状态，并只提供一个错误对象 { $aborted: [true|Any for true] }  作为响应，
 * 而并非正常的 "{ data: { error: { code: '01' } } }" 结构。
 * 因此在使用 loadDataMixin 并处理 rejected 状态时，请务必注意这一点。
 *
 * @example:
 *   angular.extend(target, loadDataMixin, {
 *     $scope: $scope,
 *
 *     // 加载数据
 *     loadData: function() {},
 *
 *     // 加载分页，若该方法存在，则忽略 loadData 方法，改为使用该方法加载数据。
 *     loadPage: function(pageIndex, itemsPerPage) {}
 *   });
 */
angular.module('app.services').factory('loadDataMixin', function(
    $timeout, $ionicScrollDelegate, loading, errorHandling, utils
) {

    /**
     * 加载器，用于执行加载操作。
     */
    function Loader(target) {
        if (this.constructor !== Loader) {
            return new Loader(target);
        }
        else {
            this.target = target;
        }
    }

    Loader.prototype = {
        constructor: Loader,

        // 数据加载对象
        target: undefined,

        // 该加载器是否已被销毁
        isDestroy: false,

        // 获取数据操作对应的 promise
        promise: undefined,

        // 在加载数据时显示的提示框
        cmLoading: undefined,

        /**
         * 执行加载器
         *
         * @params
         * @param configs {Object} 加载配置对象
         *
         *   - sign {String}
         *         执行标记，一般为如下几个值：[init, refresh, loadNextPage]，默认为 undefined。
         *
         *   - getPromiseAfterCallback {Function}
         *         该回调函数会在从 loadData 或 loadPage 等数据加载方法中获取到 promise 之后进行调用，
         *         并传入获取到的 promise，该函数应返回一个新的 promise 以供后续使用，若不返回，则继续使用所传入的 promise。
         *
         *   - showLoading {Boolean}
         *         在加载时是否显示加载中标记，默认为 true
         *
         *   - loadAttrs {Object}
         *         传递给数据加载方法的配置对象
         *
         * @params
         * @param getPromiseAfterCallback {Function} _参照 configs 中的 getPromiseAfterCallback 属性的相关说明_
         */
        run: function(param) {
            if (this.isDestroy) return false;

            var self = this,
                target = self.target,
                configs = {
                    showLoading: true,
                    loadAttrs: {}
                },
                result;

            if (typeof param === 'function') {
                configs.getPromiseAfterCallback = param;
            }
            else if (typeof param === 'object') {
                _.merge(configs, param);
            }

            // 调用加载前回调函数，如果回调函数返回 false，则取消加载。
            if (_.isFunction(target.loadBefore)) {
                result = target.loadBefore(configs);

                if (result === false) {
                    return result;
                }
            }

            target.isLoading = configs.type || true;

            // 显示加载中标记
            if (configs.showLoading) {
                loading.open();
            }

            var fulfilled = _.bind(self.fulfilled, self, configs),
                rejected = _.bind(self.rejected, self, configs),
                fin = _.bind(self.finally, self, configs),
                promise;

            // 如果是分页，则加载下一页
            if (target.isPaging) {
                promise = target.loadPage(target.nextPageIndex, target.itemsPerPage, configs.loadAttrs);
            }
            // 否则按照普通数据进行加载
            else {
                promise = target.loadData(configs.loadAttrs);
            }

            // 修改是否加载失败的状态
            promise = promise.success(function() {
                target.isFailed = false;
            }).error(function() {
                target.isFailed = configs.type;
            });

            if (configs.getPromiseAfterCallback) {
                promise = configs.getPromiseAfterCallback(promise) || promise;
            }

            self.promise = promise = promise.then(fulfilled, rejected).finally(fin);

            return promise;
        },

        // 加载成功
        fulfilled: function(configs, response) {
            if (this.isDestroy) return response;

            // 预先取出之后需要用到的数据
            var self   = this,
                target = self.target,
                data   = response.data;

            if (target.isPaging) {
                fulfilledPage();
            }
            else {
                fulfilledData();
            }

            // 待页面刷新完成后，刷新状态
            $timeout(function() {
                $ionicScrollDelegate.resize();
                if (self.target) {
                    self.target.isLoading = false;
                    self.target._canLoadNextPage();
                }
            }, 400);

            return response;

            // 处理分页数据
            function fulfilledPage() {
                // 每一次分页加载完成后，都重置并重新计算当前分页的相关信息
                target.isFirstPage = false;
                target.isLastPage = false;

                target.data = target.data || {};
                data = data || {};

                data.pageIndex = data.page || 1;

                data.totalItems = data.total || data.totalItems;

                if (data.pageIndex == null) {
                    // TODO: 应该有一个警告器
                    window.console && console.warn('[loadDataMixin] 所返回分页数据中没有 pageIndex 属性，已默认视为第一页。');
                    data.pageIndex = 1;
                }

                if (data.totalItems == null) {
                    // TODO: 应该有一个警告器
                    window.console && console.warn('[loadDataMixin] 所返回分页数据中没有 totalItems 属性。');
                }

                if (data.items == null) {
                    // TODO: 应该有一个警告器
                    window.console && console.warn('[loadDataMixin] 所返回分页数据中没有 items 属性。');
                }

                // 如果页码为 1，或没有提供页码，则视为第一页
                if (data.pageIndex === 1) {
                    target.isFirstPage = true;
                }

                // 如果 items 不存在，或者 items 里的条目数量小于分页指定条目数时，则视为已加载至最后一页
                // TODO：这里的判断会导致当最后一页的条目数量与分页指定条目数量相同时，会无法判断出为最后一页。
                // 修正 增加条件 data.items.length == data.total  解决上面的问题
                if (!data.items || data.items.length < target.itemsPerPage || data.items.length == data.total) {
                    target.isLastPage = true;
                }

                target.totalItems = data.totalItems;
                target.pageIndex = data.pageIndex;
                target.nextPageIndex = (target.pageIndex - 0) + 1;

                var nowItems = target.data.items,
                    newItems = _.union(nowItems, data.items);

                _.assign(target.data, data, {
                    items: newItems
                });
            }

            // 处理普通数据
            function fulfilledData() {
                target.data = data;
            }
        },

        rejected: function(configs, response) {
            if (!this.isDestroy) {
                errorHandling(response);
                this.target.isLoading = false;
                this.target.canLoadNextPage = false;
            }

            throw response;
        },

        finally: function(configs) {
            if (this.isDestroy) return;

            var self = this,
                target = self.target;

            loading.close();

            // 调用加载完成后的回调函数
            if (_.isFunction(this.target.loadAfter)) {
                target.loadAfter(configs);
            }

            this.promise = undefined;
        },

        destroy: function() {
            if (this.promise) {
                this.promise.cancel();
            }

            loading.close();

            this.target = undefined;
            this.isDestroy = true;
        }
    };

    var mixin = {
        // 对对应的 $scope
        $scope: undefined,

        // 加载器
        loader: undefined,

        // 存放数据
        data: undefined,

        // 是否支持分页
        isPaging: false,

        // 是否加载中，如果在执行加载器时传入的配置对象中有一个 type 属性，且其值等于 true，则 isLoading 为该属性值，
        // 否则 isLoading 为 true，当数据加载完成后，该值为 false。
        isLoading: false,

        // 最近一次的数据加载操作是否失败，如果在执行加载器时传入的配置对象中有一个 type 属性，且其值等于 true，则 isFailed 为该属性值，
        // 否则 isLoading 为 true，当最近一次的数据加载成功后，该值为 false。
        isFailed: false,

        // 是否可加载下一页
        canLoadNextPage: false,

        // 当前结果集中的条目数
        currentItemCount: undefined,
        // 总条目数
        totalItems: undefined,

        // 总页数
        totalPages: undefined,
        // 每一页的设定大小
        itemsPerPage: 12,
        // 当前页页码，第一页为 1
        pageIndex: undefined,
        // 下一页页码
        nextPageIndex: 1,

        // 是否是第一页
        isFirstPage: undefined,
        // 是否是最后一页
        isLastPage: undefined,

        /**
         * 初始化，第一次加载时使用；
         * 该方法可以重复调用，但和 refresh 不同的是，重复调用 init 方法会立刻清除当前所有的数据及已发出的请求，
         * 另外它也不支持页面的刷新功能如 ion-refresher 指令。
         */
        init: function(options) {
            var self = this;

            self.clear();

            if (typeof self.$new === 'function' && typeof self.$destroy === 'function') {
                this.$scope = self;
            }

            if (typeof self.loadPage === 'function') {
                self.isPaging = true;
            }

            self.data = undefined;
            self.loader = Loader(self);

            options = _.merge( { type: 'init' }, options );

            self.loader.run(options).finally(function() {
            });

            self.$scope && self.$scope.$on("$destroy", function() {
                self.clear();
                self.$scope = undefined;
            });

            // 调用 start 方法，执行被混入对象自己的初始化操作
            if (typeof self.start === 'function') {
                self.start();
            }
        },

        /**
         * 每一次执行数据加载操作前的回调函数，如果该函数返回 false，则取消加载。
         */
        loadBefore: _.noop,

        /**
         * 每一次完成数据加载后都会调用该方法。
         */
        loadAfter: _.noop,

        /**
         * 加载下一页的数据
         */
        loadNextPage: function(options) {
            var self = this;

            if (self.canLoadNextPage) {
                self.loader.run({
                    showLoading: false
                })
                .finally(function() {
                    clear();
                });
            }
            else {
                clear();
            }

            function clear() {
                self.$scope && self.$scope.$broadcast('scroll.infiniteScrollComplete');
            }
        },

        /**
         * 判断是否可加载下一页
         */
        _canLoadNextPage: function() {
            //
            this.canLoadNextPage = !this.isLoading && this.data && this.isPaging && !this.isLastPage;
        },

        /**
         * 刷新数据， 重新加载数据
         */
        refresh: function(options) {
            var self = this;

            if (this.isLoading) { clear(); }

            options = _.merge({
                type: 'refresh',
                emptyData: true,
                getPromiseAfterCallback: function(promise) {
                    return promise.finally(function() {
                        if (options.emptyData) {
                            utils.empty(self.data);
                        };
                        clear();
                    });
                }
            }, options);

            self.nextPageIndex = 1;

            this.loader.run(options);

            function clear() {
                self.$scope && self.$scope.$broadcast('scroll.refreshComplete');
            }
        },

        /**
         * 是否有有效数据
         * - 当为 undefined 时，尚未进行加载操作，
         * - 当为 true 时，具有有效数据，
         * - 当为 false 时，已进行数据加载，但所返回数据为空。
         * TODO: 现在有可能在使用 loadData 方式加载数据时，有可能后台返回 undefined。
         */
        hasData: function() {
            if (this.data == undefined) {
                return undefined;
            }
            else {
                if (this.isPaging) {
                    return !!(this.data.items && this.data.items.length);
                }
                else {
                    return !( _.isEmpty(this.data) );
                }
            }
        },

        /**
         * 清除数据，当调用该方法后，必须再次调用 init 方法以加载数据。
         */
        clear: function() {
            this.loader && this.loader.destroy();

            _.assign(this, {
                loader: undefined,
                data: undefined,
                isPaging: false,
                isLoading: false,
                isFailed: false,
                canLoadNextPage: false,
                currentItemCount: undefined,
                totalItems: undefined,
                totalPages: undefined,
                pageIndex: undefined,
                nextPageIndex: 1,
                isFirstPage: undefined,
                isLastPage: undefined
            });
        }
    };

    return mixin;
});
