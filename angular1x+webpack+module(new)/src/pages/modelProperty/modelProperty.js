import angular from 'angular';
import template from './modelProperty.html';
import './modelProperty.scss';

class modelPropertyController {
    constructor(CommonService, ENV, Modal, Tips) {

        this.CommonService = CommonService;
        this.ENV = ENV;
        this.Modal = Modal;
        this.Tips = Tips;

        this.$onInit = () => {
            // 初始化tabs
            this.tabsConfig = this.ENV.tabsConfig;
        };

    }

    //创建数据按钮调用
    tabsFn(arg) {
        console.log(arg);
        alert('创建数据');
    }

}

export default angular.module('app.modelProperty', [])
    .component('modelProperty', {
        template: template,
        controller: ['CommonService', 'ENV', 'Modal', 'Tips', modelPropertyController],
        controllerAs: 'modelProperty'
    })
    .name;