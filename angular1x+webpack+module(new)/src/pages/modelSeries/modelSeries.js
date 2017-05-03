import angular from 'angular';
import template from './modelSeries.html';
import './modelSeries.scss';

class modelSeriesController {
    constructor(CommonService, ENV, Modal, Tips) {

        this.CommonService = CommonService;
        this.ENV = ENV;
        this.Modal = Modal;
        this.Tips = Tips;

        this.$onInit = function () {

        };

    }

    handledClick() {

    }

}

export default angular.module('app.modelSeries', [])
.component('modelSeries', {
    template: template,
    controller: ['CommonService', 'ENV', 'Modal', 'Tips', modelSeriesController],
    controllerAs: 'modelSeries'
})
.name;