import angular from 'angular';
import template from './modal.html';
import './modal.scss';

class ModalController {
    constructor($timeout, Modal, PubSub) {
        //模态框服务
        this.$timeout = $timeout;
        this.PubSub = PubSub;

        //监听事件
        PubSub.subscribe('modalShow', listener.bind(this));
        PubSub.subscribe('modalRouter', listener.bind(this));

        //监听模态框处理数据
        function listener(config, topic) {
            switch (topic.name) {
            case 'modalShow':
                this.handleShow(config);
                break;
            case 'modalRouter':
                //路由时关闭模态框显示状态
                if (this.isShow) {
                    this.handleClose();
                }
                break;
            default:
                break;
            }
        }

    }
    //模态框显示
    handleShow(config) {
        this.block = { 'display': 'block' };
        this.$timeout(() => {
            this.isShow = true;
        }, 100);
        this.config = config;
        //默认配置尺寸sm
        this.config.size = !this.config.size ? 'sm' : 'lg';
        //默认配置按钮
        if (!this.config.buttons) {
            this.config.buttons = [
                { text: '取消', type: 'btn-default' },
                { text: '确定', type: 'btn-danger' }
            ];
        }
    }
    //模态框关闭
    handleClose() {
        this.block = { 'display': 'none' };
        this.isShow = false;
    }
    //点击遮罩背景关闭
    handleBackdrop(e) {
        if (e.target.id === 'component-modal' && this.config.backdrop) {
            this.handleClose();
        }
    }

}

//Modal
class Modal {
    constructor(PubSub) {
        this.PubSub = PubSub;
    }
    show(config) {
        //通知模态框点击事件
        this.PubSub.publish('modalShow', config);
    }
}

Modal.$inject = ['PubSub'];

//导出模块
export default angular.module('app.modal', [])
    .component('modal', {
        template: template,
        controller: ['$timeout', 'Modal', 'PubSub', ModalController],
        controllerAs: 'modal'
    })
    .service('Modal', Modal)
    .name;