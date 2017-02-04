/**
 * Tips调用
 * Tips.showHide('提示信息');
 * Tips.show('提示信息');
 * Tips.hide();
 * @param ---字符串类型---
 * @param content 提示信息 (必填)
 */
import angular from 'angular';
import template from './tips.html';
import './tips.scss';

class TipsController {
    constructor($timeout, Tips, PubSub) {
        //Tips服务
        this.$timeout = $timeout;
        this.PubSub = PubSub;

        //监听事件
        PubSub.subscribe('TipsShow', listener.bind(this));
        PubSub.subscribe('TipsHide', listener.bind(this));
        PubSub.subscribe('TipsShowHide', listener.bind(this));
        //监听模态框处理数据
        function listener(config, topic) {
            switch (topic.name) {
            case 'TipsShow':
                this.handleShow(config);
                break;
            case 'TipsHide':
                this.handleHide();
                break;
            case 'TipsShowHide':
                this.handleShowHide(config);
                break;
            default:
                break;
            }
        }
    }

    //Tips显示
    handleShow(config) {
        this.isShow = true;
        this.config = config;
    }
    //Tips关闭
    handleHide() {
        this.isShow = false;
    }

    //Tips显示关闭
    handleShowHide(config) {
        this.isShow = true;
        this.config = config;
        this.$timeout(() => {
            this.handleHide();
        }, 2000);
    }

}

//TipsService
class Tips {
    constructor(PubSub) {
        this.PubSub = PubSub;
    }
    show(config) {
        this.PubSub.publish('TipsShow', config);
    }
    hide(){
        this.PubSub.publish('TipsHide');
    }
    showHide(config){
        this.PubSub.publish('TipsShowHide', config);
    }
}
Tips.$inject = ['PubSub'];

//导出模块
export default angular.module('app.tips', [])
    .component('tips', {
        template: template,
        controller: ['$timeout', 'Tips', 'PubSub', TipsController],
        controllerAs: 'tips'
    })
    .service('Tips', Tips)
    .name;