/**
 * 应用配置
 */
_.assign(window.APP_CONFIG, {
    // 应用 key
    appkey: 'ef1fc57c13007e33',

    // 系统类型： ['android', 'ios', 'weixin']
    os: undefined,

    // 系统版本
    osVersion: undefined,

    // 应用版本，由构建工具替换
    appVersion: '<<< version >>>',

    // 客户端唯一性标识，同一设备内唯一
    unique: undefined,

    // API 服务端根地址，由构建工具替换
    service: '<<< service >>>',

    // 分站 ID
    subsiteId: undefined,

    // 地区 ID
    regionId: undefined,

    // 地区 ID
    regionName: undefined,

    // 应用语言，支持 en, zh-CN，默认中文
    language: 'zh-CN',

    // 应用渠道标记，由构建工具替换
    // 应用环境内使用 config.xml 中的设置替换
    channel: '<<< channel >>>'
});
