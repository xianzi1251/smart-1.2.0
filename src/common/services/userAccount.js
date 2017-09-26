angular.module('app.services').factory('userAccountService', ['api',function(api, messageCenter, Md5) {

    return {

        /**
         * 获取帐户余额
         */
        getAccountBalance: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_BALANCE_GET', {
                    proName: 'BYT_BALANCE_GET'
                });
        },

        /**
         * 获取IAP 商品集合
         */
        getIapProducts: function() {
            return api.post('/cosmos.json?command=scommerce.SC_IAP_PRODUCT_LIST', {
                    proName: 'SC_IAP_PRODUCT_LIST'
                });
        },

        /**
         * 获取 balanceId
         */
        getBalanceId: function(productId, receipt) {
            return api.post('/cosmos.json?command=scommerce.SC_IAP_CHARGE_SAVE', {
                    proName: 'SC_IAP_CHARGE_SAVE',
                    productId: productId,
                    receipt: receipt
                });
        },

        /**
         * 充值
         */
        recharge: function(receipt, balanceId, passKey) {
            var privateKey = 'gregierhgFDru37@rf_4ngy',
                token = Math.random().toString(36).substr(2),
                timestamp = Math.random().toFixed(20).substring(2);

            // 加密
            var sign = Md5.hex_md5(token + timestamp + balanceId + passKey + privateKey);

            return api.post('/IapServlet.slrt', {
                proName: 'IAP_RECHARGE',
                receipt: receipt,
                balanceId: balanceId,
                passKey: passKey,
                sign: sign,
                token: token,
                timestamp: timestamp
            });
        },

        /**
         * 购买记录
         */
        getAccountHistory: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_BALANCE_HISTORY_LIST', {
                    proName: 'BYT_BALANCE_HISTORY_LIST'
                });
        }
    };
}]);