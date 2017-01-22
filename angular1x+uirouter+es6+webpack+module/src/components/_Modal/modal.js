import angular from 'angular';
import template from './modal.html';
import './modal.scss';

class modalController {
    constructor($timeout, modalService, PubSub) {
        var modal = this;

        //模态框服务
        modal.modalService = modalService;
        modal.$timeout = $timeout;
        // modal.PubSub = PubSub;

        // modal.modalService.loadFn(function(el){
        //     console.log(el);
        // });

        //传递方法
        modal.modalService.loadFn(function(data){
            console.log(data);
            modal.show(data);
        });

        //监听模态框处理数据
        // function listener(topic) {
        //     switch (topic) {
        //     case 'modalShow':
        //         modal.show(data);
        //         break;
        //     case 'modalClose':
        //         modal.close();
        //         break;
        //     case 'modalRouter':
        //         modal.close();
        //         // if(modal.isShow) {
        //         //     modal.router();
        //         // }
        //         break;
        //     default:
        //         break;
        //     }

        // }


    }

    show(data) {
        

            this.$timeout(() => {
            this.block = { 'display': 'block' };
                this.isShow = true;
            }, 100);

            this.config = data;
            console.log('show');

    }

    close() {
        this.block = { 'display': 'none' };
        this.isShow = false;
    }
    router(){
        this.close();
    }



}

class modalService {
    constructor(PubSub) {
        this.PubSub = PubSub;
        console.log(PubSub);
    }
    show(config) {
        this.save(config);
    }
    loadFn(callback){
        this.myback = callback;
    };
    save(data){
        if (!this.myback) return;
        this.myback(data);
    };



}
modalService.$inject = ['PubSub'];

export default angular.module('app.modal', [])
    .component('modal', {
        template: template,
        controller: ['$timeout', 'modalService', 'PubSub', modalController],
        controllerAs: 'modal',
        bindings: {
            config: '<'
        }
    })
    .service('modalService', modalService)
    .name;