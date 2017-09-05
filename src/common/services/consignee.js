angular.module('app.services').factory('consigneeService', ['api',function(api, messageCenter) {

	return {
		
		/**
		 * 获取收货地址列表页
		 * @param entity       [默认为'account']
		 * @param entityId     [用户id]
		 * @param addressType  [默认为'shipping']
		 */
        getCosigneeList: function() {
            return api.post('/cosmos.json?command=scommerce.BYT_ADR_ADDRESS_LIST_BLOCK', {
                    proName: 'BYT_ADR_ADDRESS_LIST_BLOCK',
                    entity: 'account',
                    entityId: window.APP_USER.id,
                    addressType: 'shipping'
                });
        },

        /**
         * 确定收货人信息后，需要计算运费
         * @param addressId   [收货地址id]
         * @param districtId  [最后一级地区的ID]
         */
        getFreight: function(addressId, districtId) {
            return api.post('/cosmos.json?domain=scommerce&command=SC_ORD_ADDRESS_SAVE_ACTION', {
                    proName: 'SC_ORD_ADDRESS_SAVE_ACTION',
                    addressId: addressId,
                    districtId: districtId,
                    typeName: 'shipping',
                    saveForUser: true,
                    edit: false
                });
        },

        /**
		 * 新增收货地址
	     * @param entity      [默认为'account']
	     * @param entityId    [用户id]
	     * @param firstName   [收货人]
	     * @param typeName    [默认为'shipping']
	     * @param street      [详细地址]
	     * @param districtId  [最后一级地区的ID]
	     * @param postCode    [邮编]
	     * @param mobile      [电话]
		 */
        addCosigneeInfo: function(firstName, street, districtId, postCode, mobile) {
            return api.post('/cosmos.json?command=scommerce.BYT_ADR_ADDRESS_SAVE_ACTION', {
                    proName: 'BYT_ADR_ADDRESS_SAVE_ACTION',
                    entity: 'account',
                    entityId: window.APP_USER.id,
                    firstName: firstName,
                    typeName: 'shipping',
                    street: street,
                    districtId: districtId,
                    postCode: postCode,
                    mobile: mobile
                });
        },

        /**
         * 编辑收货地址
         * @param entity      [默认为'account']
         * @param entityId    [用户id]
         * @param addressId   [收货地址id]
         * @param firstName   [收货人]
         * @param typeName    [默认为'shipping']
         * @param street      [详细地址]
         * @param districtId  [最后一级地区的ID]
         * @param postCode    [邮编]
         * @param mobile      [电话]
         */
        editCosigneeInfo: function(addressId, firstName, street, districtId, postCode, mobile) {
            return api.post('/cosmos.json?command=scommerce.BYT_ADR_ADDRESS_SAVE_ACTION', {
                    proName: 'BYT_ADR_ADDRESS_SAVE_ACTION',
                    entity: 'account',
                    entityId: window.APP_USER.id,
                    addressId: addressId,
                    firstName: firstName,
                    typeName: 'shipping',
                    street: street,
                    districtId: districtId,
                    postCode: postCode,
                    mobile: mobile
                });
        },

        /**
         * 编辑时获取地区，选择收货地区事
         * @param districtId     [末级地区id]
         */
        getEditRegin: function(districtId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ADR_DISTRICT_GET_BLOCK', {
                    proName: 'BYT_ADR_DISTRICT_GET_BLOCK',
                    districtId: districtId
                });
        },

        /**
         * 删除收货地址
         * @param entityAddressId      [收获地址id]
         */
        deleteCosigneeInfo: function(entityAddressId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ADR_ADDRESS_DELETE', {
                    proName: 'BYT_ADR_ADDRESS_DELETE',
                    entityAddressId: entityAddressId
                })
                .success(function(data) {
                    messageCenter.publishMessage('deleteConsignee.success');
                });
        },

        /**
		 * 获取地区，选择收货地区事，根据父级地区id，查询子集
		 * @param districtCode     [父级地区id]
		 */
        getRegin: function(districtCode) {
            return api.post('/cosmos.json?command=scommerce.BYT_DIS_DISTRICT_LIST_BLOCK', {
                    proName: 'BYT_DIS_DISTRICT_LIST_BLOCK',
                    districtCode: districtCode || '353000000000'
                });
        },

        /**
         * 订单绑定收货地址
         * @param addressId         [收货地址id]
         * @param orderId           [订单id]
         */
        consigneeBindOrder: function(addressId, orderId) {
            return api.post('/cosmos.json?command=scommerce.BYT_ORD_ADR_SAVE', {
                    proName: 'BYT_ORD_ADR_SAVE',
                    addressId: addressId,
                    orderId: orderId
                });
        }

	};
}]);