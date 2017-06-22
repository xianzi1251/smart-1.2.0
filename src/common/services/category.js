angular.module('app.services').factory('categoryService', ['api',function(api) {

    return {

        /**
         * 获取一级分类
         * @param categoryName
         */
        getCategorylist: function(categoryName) {
            return api.post('/cosmos.json?command=scommerce.BYT_CATEGORY_GET', {
                    proName: 'BYT_CATEGORY_GET',
                    categoryName: categoryName
                });
        },

        /**
         * 获取分类的商品列表
         * @param categoryId
         */
        getCategoryItem: function(categoryId) {
            return api.post('/cosmos.json?command=scommerce.BYT_COMMODITY_GETBYCATEGORY', {
                    proName: 'BYT_COMMODITY_GETBYCATEGORY',
                    categoryId: categoryId
                });
        }
    };
}]);