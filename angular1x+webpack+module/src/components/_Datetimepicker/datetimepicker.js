const $ = window.$;
//日历控件调用
let initDateInput = function (selector, format) {
    $(selector).datetimepicker({
        language: 'zh-CN',
        format: format,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });
};

let datetimepickerComponent = [function () {
    return {
        restrict: 'EA',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            var unregister = scope.$watch(function () {

                $(element).append('<input id="date-' + attrs.dateid + '" class="form-control cur" ' + 'readonly ' + 'placeholder=' + attrs.placeholder + ' value="' + ctrl.$modelValue + '">');
                $(element).css('padding', '0');

                //初始化显示当前日期
                if (!ctrl.$modelValue) {
                    $('#date-' + attrs.dateid).val('');
                }

                $(element).on('change', function () {
                    scope.$apply(function () {
                        ctrl.$setViewValue($('#date-' + attrs.dateid).val());
                    });
                });

                $(element).on('click', function () {
                    initDateInput('#date-' + attrs.dateid, 'yyyy-mm-dd');
                });
                $(element).click();

                return ctrl.$modelValue;
            }, initialize);

            function initialize(value) {
                ctrl.$setViewValue(value);
                unregister();
            }
        }
    };
}];

export default datetimepickerComponent;


