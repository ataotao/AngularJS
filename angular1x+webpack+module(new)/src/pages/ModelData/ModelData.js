import angular from 'angular';
import template from './modelData.html';
import './modelData.scss';

class modelDataController {
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

export default angular.module('app.modelData', [])
.component('modelData', {
    template: template,
    controller: ['CommonService', 'ENV', 'Modal', 'Tips', modelDataController],
    controllerAs: 'modelData'
})
.name;