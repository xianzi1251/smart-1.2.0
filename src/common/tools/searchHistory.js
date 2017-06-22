angular.module('app.services').provider('searchHistory', function() {
    var provider = this;

    /**
     * 最多存储多少个关键字，当超出该指定数量时若继续添加，则会移除最早添加的关键字
     * 若为 undefined, 则不做限制
     * 默认为 200
     */
    provider.maxStorageNumber = 200;

    // @ngInject
    provider.$get = function(localStorage) {
        var LOCAL_STORAGE_KEY = 'history-search-keywords',
            keywords = localStorage.get(LOCAL_STORAGE_KEY, [], true);

        return {
            /**
             * 获取所有本地存储的历史搜索关键字
             */
            getAll: function() {
                return keywords;
            },

            /**
             * 存储一个搜索关键字
             */
            add: function(keyword) {
                keyword = _.trim(keyword);

                if (!keyword) return;

                var index = _.indexOf(keywords, keyword);

                // 若待添加的关键字已存在，则视为修改其顺序，将其放到最上面
                if (index !== -1) {
                    keywords.splice(index, 1);
                }
                // 若为新添加关键字，且当前已超出最大存储数量，则移除最早添加的关键字
                else if (provider.maxStorageNumber && keywords.length >= provider.maxStorageNumber) {
                    keywords.pop();
                }

                keywords.unshift(keyword);
                this._storage();
            },

            /**
             * 清空搜索历史记录
             */
            clear: function() {
                keywords.splice(0, keywords.length);
                this._storage();
            },

            /**
             * 存储当前所有搜索关键字
             */
            _storage: function() {
                localStorage.set(LOCAL_STORAGE_KEY, keywords);
            }
        };
    };
});
