/**
 * 国际化配置 - 英文
 */
_.merge(window.APP_LANG, {
    en: {
        // 语言名称
        $name: 'English',

        login: 'Login',
        register: 'Register',

        // 各状态的提示信息
        stateTexts: {
            unknownException: 'en-未知异常，请刷新重试。',       // 系统出现未知异常时的提示信息
            notLogin: 'en-用户未登录',                         // 用户未登录时的提示信息
            networkAnomaly: 'en-网络异常',                     // 网络异常，无法访问到接口服务器时的提示信息
            serviceException: 'en-服务器繁忙，请您稍后再试。',    // 当调用接口时，响应异常状态码
            payFailed: 'en-支付失败',
            payCanceled: 'en-支付已取消',
            paySuccess: 'en-支付成功',
            notInstalledWechat: 'en-您没有安装微信应用'
        }
    }
});
