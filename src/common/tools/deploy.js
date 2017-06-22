/**
 * 热部署
 */
angular.module('app.services').factory('deploy', function(
    api
) {
    var NO_PLUGIN = 'missing plugin';
    var INITIAL_DELAY = 1 * 5 * 1000;
    var WATCH_INTERVAL = 1 * 60 * 1000;

    var deploy = null;

    /**
     * 获取需要在调用热部署相关接口时在请求头中附加的数据
     */
    function getHeaders() {
        return {
            appkey: APP_CONFIG.appkey
        };
    }

    var deployService = {
        // 初始化服务
        init: function() {
            deploy = window.Deploy;

            var options = {
                debug: true,
                checkUrl: APP_CONFIG.service + '/version/check',
                requestHeaders: getHeaders()
            };

            if (deploy) {
                deploy.init(options, angular.noop, function() {
                    deploy = null;
                });
            }
        },

        update: function() {
            var self = this;

            return self.check()
                .then(function(response) {
                    console.info('Deploy: update - has update - ' + response.data);
                    if (response.data === true) {
                        return self.download();
                    }
                    else {
                        throw 'not check';
                    }
                })
                .then(function() {
                    return self.extract();
                })
                .then(function(result) {
                    self.load();
                });
        },

        /**
         * Check for updates
         *
         * @return {Promise} Will resolve with true if an update is available, false otherwise.
         * A string or error will be passed to reject() in the event of a failure.
         */
        check: function check() {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();
            var channel = APP_CONFIG.channel == 'test' ? 'test' : 'production';

            deploy.check(channel, function (result) {
                if (result && result === "true") {
                    deferred.resolve({ data: true });
                } else {
                    deferred.resolve({ data: false });
                }
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },

        /**
         * Download and available update
         *
         * This should be used in conjunction with extract()
         * @return {Promise} The promise which will resolve with true/false or use
         *    notify to update the download progress.
         */
        download: function download() {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();

            deploy.download(function (result) {
                if (result !== 'true' && result !== 'false') {
                    ;
                } else {
                    deferred.resolve({ data: result === 'true'});
                }
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },

        /**
         * Extract the last downloaded update
         *
         * This should be called after a download() successfully resolves.
         * @return {Promise} The promise which will resolve with true/false or use
         *                   notify to update the extraction progress.
         */
        extract: function extract() {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();

            deploy.extract(function (result) {
                if (result !== 'done') {
                    ;
                } else {
                    deferred.resolve({data: result === 'done'});
                }
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },

        /**
         * Load the latest deployed version
         * This is only necessary to call if you have manually downloaded and extracted
         * an update and wish to reload the app with the latest deploy. The latest deploy
         * will automatically be loaded when the app is started.
         *
         * @return {void}
         */
        load: function load() {
            if (!deploy) return;

            deploy.redirect();
        },

        /**
         * Watch constantly checks for updates, and triggers an
         * event when one is ready.
         * @param {object} options Watch configuration options
         * @return {Promise} returns a promise that will get a notify() callback when an update is available
         */
        watch: function watch(options) {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();
            var self = this;

            if (typeof opts.initialDelay === 'undefined') {
                opts.initialDelay = INITIAL_DELAY;
            }
            if (typeof opts.interval === 'undefined') {
                opts.interval = WATCH_INTERVAL;
            }

            function checkForUpdates() {
                this.check().then(function (hasUpdate) {
                    if (hasUpdate) {
                        ;
                    }
                }, angular.noop);

                // Check our timeout to make sure it wasn't cleared while we were waiting
                // for a server response
                if (this._checkTimeout) {
                    this._checkTimeout = setTimeout(checkForUpdates.bind(self), opts.interval);
                }
            }

            // Check after an initial short deplay
            this._checkTimeout = setTimeout(checkForUpdates.bind(self), opts.initialDelay);

            return deferred.promise;
        },

        /**
         * Stop automatically looking for updates
         * @return {void}
         */
        unwatch: function unwatch() {
            clearTimeout(this._checkTimeout);
            this._checkTimeout = null;
        },

        /**
         * Information about the current deploy
         *
         * @return {Promise} The resolver will be passed an object that has key/value
         *    pairs pertaining to the currently deployed update.
         */
        info: function info() {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();

            deploy.info(function (result) {
                deferred.resolve({ data: result });
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        },

        /**
         * List the Deploy versions that have been installed on this device
         *
         * @return {Promise} The resolver will be passed an array of deploy uuids
         */
        getVersions: function getVersions() {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();

            deploy.getVersions(function (result) {
                deferred.resolve({ data: result });
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        },

        /**
         * Remove an installed deploy on this device
         *
         * @param {string} uuid The deploy uuid you wish to remove from the device
         * @return {Promise} Standard resolve/reject resolution
         */
        deleteVersion: function deleteVersion(uuid) {
            if (!deploy) return api.reject(NO_PLUGIN);

            var deferred = api.defer();

            deploy.deleteVersion(uuid, function (result) {
                deferred.resolve({ data: result });
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }
    };

    deployService.init();

    return deployService;
});
