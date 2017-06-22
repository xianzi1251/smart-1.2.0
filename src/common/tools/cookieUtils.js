/**
 * 提供cookie读写操作
 */
angular.module("app.services").factory("cookieUtils", function() {

    return {

        // 根据名称删除cookie
        deleteCookieByName: function(name) {
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            document.cookie = name + "=; expire=" + date.toGMTString() + "; path=/";
        },

        // 根据名称获取cookie
        getCookieByName: function(name) {

            var cookies = document.cookie,
                nameStartIndex,
                cookieStartIndex,
                cookieEndIndex,
                cookie;

            if (!cookies) return undefined;

            nameStartIndex = cookies.indexOf(name + '=');

            if (nameStartIndex > -1) {
                cookieStartIndex = nameStartIndex + name.length + 1;
                cookieEndIndex = cookies.indexOf(';', cookieStartIndex);

                if (cookieEndIndex === -1) {
                    cookieEndIndex = cookies.length;
                }

                cookie = unescape(cookies.substring(cookieStartIndex, cookieEndIndex));
            }

            return cookie;
        }
    };
});
