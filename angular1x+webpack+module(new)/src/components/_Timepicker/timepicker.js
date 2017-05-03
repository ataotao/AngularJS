import template from './timepicker.html';
import angular from 'angular';

// 日历选择
import moment from 'moment';
import 'angular-bootstrap-datetimepicker';
moment.locale('zh-cn');

class timepickerController {
    constructor() {

    }

    onTimeSet(newDate) {
        this.scopeData = moment(newDate).format('YYYY-MM-DD');
        this.datepickerstate = !this.datepickerstate;
    }

    handleClick(){
        this.datepickerstate = true;
    }
}

export default angular.module('app.timepicker', ['ui.bootstrap.datetimepicker'])
    .component('timepicker', {
        template: template,
        bindings: {
            placeholder: '<',
            scopeData: '=',
            changefn: '&'
        },
        controller: [timepickerController],
        controllerAs: 'timepicker'
    })
    .name;