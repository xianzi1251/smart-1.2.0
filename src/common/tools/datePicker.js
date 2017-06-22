/**
 * 日期选择器
 * https://github.com/rajeshwarpatlolla/ionic-datepicker
 *
 * 配置：
 * 将 datePicker 混入目标 $scope，controller 需提供对应的方法如 datePickerCallbackModal 以提供回调。
 *
 * 使用方法：
 *     <ionic-datepicker input-obj="datepickerObjectModal">
 *         <button class="button button-block button-positive"> Modal </button>
 *     </ionic-datepicker>
 */
angular.module('app.services').factory('datePicker', function() {
    var monthsList = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

    var config = {
        todayLabel: '今天',
        closeLabel: '关闭',
        setLabel: '选择',
        showTodayButton: true,
        mondayFirst: true,
        dateFormat: 'yyyy-MM-dd',
        weeksList: ["日", "一", "二", "三", "四", "五", "六"],
        monthsList: monthsList,
        closeOnSelect: false,
        from: new Date(1950, 1, 1),
        to: new Date(2050, 1, 1)
    };

    var datepickerObjectPopup = {},
        datepickerObjectModal = {};

    angular.extend(datepickerObjectPopup, config, {
        templateType: 'popup',
        callback: function(val) {
            datePickerCallbackPopup(val);
        }
    });

    angular.extend(datepickerObjectModal, config, {
        templateType: 'modal',
        callback: function(val) {
            datePickerCallbackModal(val);
        }
    });

    return {
        datepickerObjectPopup: datepickerObjectPopup,
        datepickerObjectModal: datepickerObjectModal
    };
});
