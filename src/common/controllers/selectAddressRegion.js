/**
 * 选择地区，目前只能固定选择三级区域。
 *
 * ## params
 * - successCallback {Function} 当选择成功后，将调用该回调函数，并传入所选择地区的 ID 及该地区路径数据。
 *   - regions {Array<Object>} 地区信息数组，数组元素为对象，有两个属性：id 为地区 ID，name 为地区显示名称
 *
 * @example
 * modals.selectRegion.open({
 *     params: {
 *         successCallback: function(selectedRegionId, selectedRegions) { ... },
 *         regions: [
 *             { id: '12384', 'name': '北京' },
 *             { id: '12385', 'name': '北京市' },
 *             { id: '12386', 'name': '朝阳区' }
 *         ]
 *     }
 * });
 */
angular.module('app.controllers').controller('selectAddressRegionCtrl', function(
    $scope, $params, consigneeService, messageCenter, errorHandling, loading,
    api, $ionicScrollDelegate, $ionicHistory
) {

    $params = _.defaults({}, $params, {
        successCallback: _.noop,
        regions: []
    });

    // 选择最后一个地区的同级地区
    $params.regions = [].concat($params.regions);
    $params.regions.pop();

    angular.extend(this, {
        // 当前需要显示的地区数据
        regionItems: {},

        // 所选择的地区数据
        selectedRegions: $params.regions,

        selectedRegionsName: "",

        // 缓存数据
        cache: {},

        /**
         * 加载地区集合
         * @param parentRegionId {String} 父级地区 ID，若提供该参数，将加载该地区的所有子地区数据
         */
        loadRegionItems: function(parentRegionId) {
            var cacheData = this.cache[parentRegionId || '_def'];

            if (cacheData) {
                this.regionItems = cacheData;
                return api.when(cacheData);
            }
            else {
                loading.open();
                return consigneeService.getRegin(parentRegionId)
                    .success((function(data) {
                        this.regionItems = data.list[0];
                        this.cache[parentRegionId || '__def'] = data.list[0];
                    }).bind(this))
                    .finally(function() {
                        loading.close();
                    });
            }
        },

        selectRegion: function(selectedRegion) {
            this.selectedRegions.push(selectedRegion);
            this.setSelectedRegionsName();

            this.loadRegionItems(selectedRegion.code).success((function(data) {
                if (!data.list[0] || !data.list[0].length) {
                    this.quit();
                }

                var oldHistoryId = $scope.$historyId;
                $scope.$historyId = $ionicHistory.currentHistoryId();
                $ionicScrollDelegate.$getByHandle('regionDelegate').scrollTop(false);
                $scope.$historyId = oldHistoryId;

            }).bind(this));
        },

        backspace: function() {
            this.selectedRegions.pop();
            this.setSelectedRegionsName();
            this.loadRegionItems(_.get(_.last(this.selectedRegions), 'code'));
        },

        // 退出编辑页面，需发布（pub）选中的地区
        quit: function() {
            var selectedRegionId = _.get(_.last(this.selectedRegions), 'code');
            $params.successCallback(selectedRegionId, this.selectedRegions);
            $scope.modals.selectAddressRegion.close();
        },

        // 拼装区域名称
        setSelectedRegionsName: function() {
            var name = "";

            _.forEach(this.selectedRegions, function(region) {
                name += region.label + ' , ';
            });

            this.selectedRegionsName = name;
        }
    });

    this.loadRegionItems(_.get(_.last(this.selectedRegions), 'code'));
    this.setSelectedRegionsName();
});
