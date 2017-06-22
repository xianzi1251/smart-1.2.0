/**
 * 一些简单的辅助函数
 */
angular.module('app').factory('utils', function() {
    return {

        /**
         * 清空一个数组或对象
         */
        empty: function(target) {
            if (!target) { return; }

            if (Object.prototype.toString.call(target) === '[object Array]') {
                target.splice(0, target.length);
            }
            else if (typeof target === 'object') {
                var _hasown = Object.prototype.hasOwnProperty;
                for (var name in target) {
                    if (_hasown.call(target, name)) {
                        delete target[name];
                    }
                }
            }

            return target;
        },

        /**
         * 代理函数
         */
        proxy: function(object, name) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function() {
                return object[name].apply(object, args.concat(Array.prototype.slice.call(arguments)));
            };
        },

        /**
         * 获取一个元素的大小和相对垂直滚动区的偏移量，并对结果进行缓存
         * 未强制重新获取时优先使用缓存数据
         * 当元素不可见且祖先元素中存在动态置换元素时，使用该动态置换元素已缓存的数据
         * @param  {Object} $element  元素的jQuery对象
         * @param  {Boolean} refresh  是否重新获取
         */
        getElementRect: function($element, refresh) {
            var elementRect =  $element.data('elementRect');

            if (!elementRect || refresh) {
                var element = $element,
                    offsetLeft = 0,
                    offsetTop = 0,
                    rect = $element[0].getBoundingClientRect();

                if ($element.is(':visible')) {
                    do {
                        var offset = ionic.DomUtil.getPositionInParent(element[0]);
                        offsetLeft += offset.left;
                        offsetTop += offset.top;
                        element = element.offsetParent();
                        if (element.is('html')) {
                            break;
                        }
                    } while(!element.hasClass('scroll-content'));
                } else {
                    $element.parents('[cm-scroll-render]').each(function() {
                        var data = $(this).data('elementRect');
                        if (data) {
                            rect = data;
                            return false;
                        }
                    });
                }

                elementRect = {
                    width: rect.width,
                    height: rect.height,
                    offsetLeft: offsetLeft,
                    offsetTop: offsetTop
                };
                $element.data('elementRect', elementRect);
            }

            return elementRect;
        },

        /**
         * 地球坐标系转为火星坐标系
         * @param  {Object} coords  坐标对象{维度， 经度}
         */
        transformFromWGSToGCJ: function (coords) {
            // const PI
            var PI = Math.PI;
            // Krasovsky 1940
            //
            // a = 6378245.0, 1/f = 298.3
            // b = a * (1 - f)
            // ee = (a^2 - b^2) / a^2;
            var a = 6378245.0;
            var ee = 0.00669342162296594323;

            function Rectangle(lng1, lat1, lng2, lat2) {
                this.west = Math.min(lng1, lng2);
                this.north = Math.max(lat1, lat2);
                this.east = Math.max(lng1, lng2);
                this.south = Math.min(lat1, lat2);
            }

            function isInRect(rect, lon, lat) {
                return rect.west <= lon && rect.east >= lon && rect.north >= lat && rect.south <= lat;
            }
            //China region - raw data
            var region = [
                new Rectangle(79.446200, 49.220400, 96.330000, 42.889900),
                new Rectangle(109.687200, 54.141500, 135.000200, 39.374200),
                new Rectangle(73.124600, 42.889900, 124.143255, 29.529700),
                new Rectangle(82.968400, 29.529700, 97.035200, 26.718600),
                new Rectangle(97.025300, 29.529700, 124.367395, 20.414096),
                new Rectangle(107.975793, 20.414096, 111.744104, 17.871542)
            ];
            //China excluded region - raw data
            var exclude = [
                new Rectangle(119.921265, 25.398623, 122.497559, 21.785006),
                new Rectangle(101.865200, 22.284000, 106.665000, 20.098800),
                new Rectangle(106.452500, 21.542200, 108.051000, 20.487800),
                new Rectangle(109.032300, 55.817500, 119.127000, 50.325700),
                new Rectangle(127.456800, 55.817500, 137.022700, 49.557400),
                new Rectangle(131.266200, 44.892200, 137.022700, 42.569200)
            ];

            function isInChina(lon, lat) {
                for (var i = 0; i < region.length; i++) {
                    if (isInRect(region[i], lon, lat)) {
                        for (var j = 0; j < exclude.length; j++) {
                            if (isInRect(exclude[j], lon, lat)) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
                return false;
            }

            function transformLat(x, y) {
                var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
                ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
                ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
                return ret;
            }

            function transformLon(x, y) {
                var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
                ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
                ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
                ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
                return ret;
            }

            // World Geodetic System ==> Mars Geodetic System
            function transform(wgLon, wgLat) {
                var mgLoc = {};
                if (!isInChina(wgLon, wgLat)) {
                    mgLoc = {
                        lat: wgLat,
                        lng: wgLon
                    };
                    return mgLoc;
                }
                var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
                var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
                var radLat = wgLat / 180.0 * PI;
                var magic = Math.sin(radLat);
                magic = 1 - ee * magic * magic;
                var sqrtMagic = Math.sqrt(magic);
                dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
                dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
                mgLoc = {
                    lat: wgLat + dLat,
                    lng: wgLon + dLon
                };
                return mgLoc;
            }
            return transform(coords.lng, coords.lat);
        },

        /**
         * 获取2个坐标点之间的直线距离
         * @param {Object} pos1
         * @param {Object} pos2
         */
        getFlatternDistance: function (pos1, pos2) {

            var EARTH_RADIUS = 6378137.0; //单位M
            var PI = Math.PI;

            function getRad(d) {
                return d * PI / 180.0;
            }

            var f = getRad((pos1.lat + pos2.lat) / 2);
            var g = getRad((pos1.lat - pos2.lat) / 2);
            var l = getRad((pos1.lng - pos2.lng) / 2);

            var sg = Math.sin(g);
            var sl = Math.sin(l);
            var sf = Math.sin(f);

            var s, c, w, r, d, h1, h2;
            var a = EARTH_RADIUS;
            var fl = 1 / 298.257;

            sg = sg * sg;
            sl = sl * sl;
            sf = sf * sf;

            s = sg * (1 - sl) + (1 - sf) * sl;
            c = (1 - sg) * (1 - sl) + sf * sl;

            w = Math.atan(Math.sqrt(s / c));
            r = Math.sqrt(s * c) / w;
            d = 2 * w * a;
            h1 = (3 * r - 1) / 2 / c;
            h2 = (3 * r + 1) / 2 / s;

            return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
        }

    };
});
