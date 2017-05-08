import angular from 'angular';
import template from './tabs.html';
import './tabs.scss';

class tabsController {
    constructor(ENV, CommonService, Modal, Tips) {
        let vm = this;
        //公用服务
        vm.CommonService = CommonService;
        //模态框服务
        vm.Modal = Modal;
        //Tips服务
        vm.Tips = Tips;
        //全局路径
        vm.ENV = ENV;
        //初始化
        vm.$onInit = () => {

        };
    }

    method() {
        this.fn({arg:'add'});
    }
}

export default angular.module('app.tabs', [])
    .component('tabs', {
        template: template,
        bindings: {
            config: '<',
            fn: '&'
        },
        controller: ['ENV', 'CommonService', 'Modal', 'Tips', tabsController],
        controllerAs: 'tabs'
    })
    .name;