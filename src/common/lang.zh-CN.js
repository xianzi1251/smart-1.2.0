/**
 * 国际化配置 - 中文
 */
_.merge(window.APP_LANG, {
    'zh-CN': {
        $name: '中文（简体）',
        exitApp: '再按一次退出应用',

        // 各状态的提示信息
        stateTexts: {
            unknownException: '未知异常，请刷新重试。', // 系统出现未知异常时的提示信息
            notLogin: '用户未登录', // 用户未登录时的提示信息
            networkAnomaly: '网络异常', // 网络异常，无法访问到接口服务器时的提示信息
            timeoutException: '请求超时', // 请求超时
            serviceException: '服务器繁忙，请您稍后再试。', // 当调用接口时，响应异常状态码
            payFailed: '支付失败',
            payCanceled: '支付已取消',
            paySuccess: '支付成功',
            notInstalledWechat: '您没有安装微信应用'
        }
    }   
});
