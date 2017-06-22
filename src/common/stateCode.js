/**
 * 状态码配置，此处的状态码兼容业务接口所响应的状态码，
 * 并添加了一些客户端自定义的状态码，客户端自定义的状态码会添加前缀「C」。
 */
(function() {
    var stateCode = {
        unknownException: '1',     // 未知异常
        notLogin:         '3',     // 用户未登录
        decryptFail:      '5',     // 解密失败
        networkAnomaly:   'C1',    // 网络异常
        abortRequest:     'C2',    // 请求被中止
        serviceException: 'C3',    // 当调用接口时，响应异常状态码
        payFailed:        'C4',    // 支付失败
        payCanceled:      'C5',    // 取消支付
        paySuccess:       'C6',    // 支付成功
        notInstalledWechat: 'C7'   // 没有安装微信应用
    };

    // 交换 stateCode 中的 key 和 value，并将交换结果放入 stateCode 中，
    // 使 stateCode 成为一个状态名及状态码的双向映射表
    _.assign(stateCode, _.transform(stateCode, function(result, stateCode, stateName) {
        result[stateCode] = stateName;
    }));

    // 作为常量模块注册到 angular 中
    _.assign(window.APP_STATE_CODE, stateCode);
})();
