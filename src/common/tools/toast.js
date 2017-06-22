/**
 * toast - 显示一个消息提示框
 *
 * - 支持一定时间后自动隐藏
 * - 支持手动隐藏
 *
 *
 * ## 配置对象
 *
 * - template    {String|Element|jQuery}  模板
 * - templateUrl {String}                 模板 URL
 * - customClass {String}                 自定义类名，多个类名之间使用空格字符进行区分
 * - duration    {Integer}                显示持续时间，到时间后自动隐藏；如果为 0，则根据显示内容自动计算一个时间，如果为 -1，则不自动隐藏。
 * - delay       {Integer}                延迟显示时间，当调用 open 方法时会延迟该指定时间才会显示，若在这段时间之内调用了 close 方法，则不再显示。
 * - position    {"center"|"bottom"}      显示位置
 * - offset      {Integer}                位置偏移
 * - penetrate   {Boolean}                指针是否穿透 toast；如果设置为 false，则在 toast 显示时，用户不能进行任何操作，直到 toast 被隐藏。
 * - callbacks   {Object}                 回调函数
 *   - close     {Function}               关闭时的回调函数
 */
angular.module('app.services').factory('toast', function(
    $ionicTemplateLoader, $ionicBody, $q, $timeout, $compile
) {

    var

    DURATIONS = {
        short: 2000,
        long: 6000
    },

    // toast 的 HTML 模板
    TOAST_TPL =
        '<div class="toast-container">' +
        '<div class="toast"></div>' +
        '</div>',

    // 定位设置
    OFFSET = {
        bottom: function(element, offset) {
            element.data('toast-original-bottom', element.css('bottom'));
            element.css('bottom', offset);
        },
        center: _.noop
    },

    // 清除定位设置
    CLEAR_OFFSET = {
        bottom: function(element, offset) {
            element.css('bottom', element.data('toast-original-bottom'));
            element.removeData('toast-original-bottom');
        },
        center: _.noop
    },

    // 默认配置
    DEFAULT_OPTIONS = {
        template: 'toast',
        position: 'bottom',
        offset: 80,
        penetrate: true
    };


    function Toast(options) {
        this._setOptions.apply(this, arguments);
        this._defaultOptions = this._options;
    }

    _.assign(Toast.prototype, {
        // 是否创建
        isCreate: false,

        // 是否打开
        isOpen: false,

        // 是否关闭
        isClose: true,

        // 当前配置
        _options: undefined,

        // 上一次打开时的配置
        _lastOptions: undefined,

        // 在创建对象时指定的默认配置
        _defaultOptions: undefined,

        // 自动关闭倒计时
        _durationTimer: undefined,

        // 延迟显示倒计时
        _delayTimer: undefined,

        _promise: undefined,

        /**
         * 设置 options 对象
         */
        _setOptions: function() {
            var options = this.processingOptions.apply(this, arguments) || angular.extend({}, DEFAULT_OPTIONS);

            this._lastOptions = this._options;
            this._options = options;

            return this._options;
        },

        /**
         * 根据所传入的内容，生成一个合法的配置对象
         * * 该方法提供给 toast 的扩展组件使用
         */
        processingOptions: function() {
            var options = [];

            angular.forEach(Array.prototype.slice.call(arguments, 0), function(option) {
                if (option == null) { return; }

                // "toast.open('toast text')"  equals "toast.open({ template: 'toast text' })"
                if ( _.isString(option) ) {
                    option = { template: option };
                }

                // 处理显示持续时间，若指定模板内容，则根据模板内容自动计算该时间
                if (!option.duration && option.template) {
                    option.duration = computationReadTime(option.template, DURATIONS.short, DURATIONS.long);
                }

                options.push(option);
            });

            if (options.length) {
                options.unshift({}, DEFAULT_OPTIONS, this._defaultOptions);
                return angular.extend.apply(angular, options);
            }
            else {
                return undefined;
            }
        },

        /**
         * 创建 toast 结构
         */
        _create: function() {
            var self = this;

            if (self._toastContainer) {
                return $q.when(self._toastContainer);
            }
            else if (this._promise) {
                return this._promise;
            }
            else {
                return this._promise = $ionicTemplateLoader.compile({
                    template: TOAST_TPL,
                    appendTo: $ionicBody.get()
                })
                .then(function(toastContainer) {
                    self.isCreate = true;
                    self._toastContainer = toastContainer;
                    toastContainer.toastElement = toastContainer.element.children();

                    return toastContainer;
                });
            }
        },

        /**
         * 基于当前的 options 对象，更新 toast
         */
        _update: function(toastContainer) {
            var lastOptions = this._lastOptions,
                options     = this._options,

                container   = toastContainer.element,
                toast       = toastContainer.toastElement,

                templatePromise;

            if (lastOptions) {
                container.removeClass(lastOptions.customClass);
                container.removeClass(lastOptions.position);
                CLEAR_OFFSET[lastOptions.position](toast, lastOptions.offset);
            }

            container.addClass(options.customClass);
            container.addClass(options.position);
            OFFSET[options.position](toast, options.offset);

            templatePromise = options.templateUrl ?
                $ionicTemplateLoader.load(options.templateUrl) :
                $q.when(options.template || '');

            return this._promise = templatePromise.then(function(template) {
                if (template) {
                    toast.empty().append(template);
                    $compile(toast.contents())(toastContainer.scope);
                }

                return toastContainer;
            });
        },

        /**
         * 显示 toast，toast 支持重复打开，并在每次打开时传入不同的配置。
         * options* {String|Object} 若为字符串，则视为显示内容；可传入多个配置参数，后传入的会覆盖前面的。
         *
         * @example
         *
         *     // 显示一条提示信息，并在一定时间后关闭
         *     toast.open('toast text');
         *
         *     // 显示一条提示信息，并在 1 秒后关闭
         *     toast.open('toast text', { duration: 1000 });
         *
         *     // 与上面相同
         *     toast.open({
         *         template: 'toast text',
         *         duration: 1000
         *     });
         */
        open: function(options) {
            var self = this;

            options = self._setOptions.apply(self, arguments);

            self._clearDelayTimer();
            self._clearDurationTimer();

            self.isOpen = true;
            self.isClose = false;

            self._create()
                .then(angular.bind(self, self._update))
                .then(function(toastContainer) {
                    if (self.isClose) { return; }

                    if (options.delay > 0) {
                        self._delayShow(options.delay, toastContainer);
                    }
                    else {
                        self._show(toastContainer);
                    }
                });
        },

        _delayShow: function(delay, toastContainer) {
            var self = this;

            self._delayTimer = $timeout(function() {
                self._show(toastContainer);
                self._delayTimer = undefined;
            }, delay);
        },

        _show: function(toastContainer) {
            var self = this,
                options = this._options;

            if (self.isClose) { return; }

            ionic.requestAnimationFrame(function() {
                if (self.isClose) { return; }

                toastContainer.element.addClass('visible');
                toastContainer.element.toggleClass('toast-container-penetrate', options.penetrate);
                toastContainer.toastElement.addClass('active');
            });

            if (options.duration !== -1) {
                self._durationTimer = $timeout(function() {
                    self.close();
                    self._durationTimer = undefined;
                }, options.duration);
            }
        },

        /**
         * 关闭 toast
         */
        close: function() {
            var self = this,
                options = this._options;

            if (self.isClose) { return; }

            self.isOpen = false;
            self.isClose = true;

            self._clearDelayTimer();
            self._clearDurationTimer();

            self._promise.then(function(toastContainer) {
                ionic.requestAnimationFrame(function() {
                    if (self.isClose) {
                        toastContainer.toastElement.removeClass('active');

                        var duration = parseCSSTimeValue(toastContainer.toastElement.css('animation-duration')) ||
                                parseCSSTimeValue(toastContainer.toastElement.css('transition-duration'));

                        setTimeout(function() {
                            self.isClose && toastContainer.element.removeClass('visible');
                        }, duration);
                    }
                });
            });

            if (options.callbacks && options.callbacks.close) {
                options.callbacks.close();
            }
        },

        _clearDurationTimer: function() {
            if (this._durationTimer) {
                $timeout.cancel(this._durationTimer);
                this._durationTimer = undefined;
            }
        },

        _clearDelayTimer: function() {
            if (this._delayTimer) {
                $timeout.cancel(this._delayTimer);
                this._delayTimer = undefined;
            }
        }
    });

    var defaultToast = new Toast();

    _.forEach(['open', 'close'], function(methodName) {
        Toast[methodName] = function() {
            defaultToast[methodName].apply(defaultToast, arguments);
        };
    });

    /**
     * 预估一段文本内容的阅读时间
     * 规则： 按照一秒内阅读 6 个字进行预估
     * Note: 适用于中文环境
     * @param str {String} 待预估的中文文本内容
     * @param minTime {Integer} 最小时间
     * @param maxTime {Integer} 最大时间
     * @return {Number} 毫秒值
     */
    function computationReadTime(str, minTime, maxTime) {
        str = str || '';
        minTime = parseInt(minTime, 10) || -Infinity;
        maxTime = parseInt(maxTime, 10) || Infinity;

        return Math.min(Math.max(minTime, (str.length / 6) * 1000), maxTime);
    }

    /**
     * 解析 CSS 的时间属性值
     */
    function parseCSSTimeValue(timeValue) {
        var time;

        if (timeValue.indexOf('ms') !== -1) {
            time = parseInt(timeValue);
        }
        else {
            time = parseFloat(timeValue) * 1000;
        }

        return time;
    }

    return Toast;
});
