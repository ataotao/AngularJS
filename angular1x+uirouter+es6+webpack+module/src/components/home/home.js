import angular from 'angular';
import homeService from './homeService';
import template from './home.html';
import actionModal from './actionModal.html';
import style from './home.scss';

class HomeController {
    constructor($http, $timeout, commonService, homeService, ModalService) {
        //公用服务
        this.commonService = commonService;
        //模块服务
        this.homeService = homeService;
        //模态框服务
        this.ModalService = ModalService;

        //初始化值
        this.url = './json/test.json';
        this.registerBrandUrl = './json/registerBrand.json';

        this.ccc = style;
        this.name = 'Home';
        this.color = 'blue';

        //$onInit() 方法会在组件及其所有 binding 初始化之后被 compiler 调用，从而我们就有了一个清晰的地方统一存放数据初始化的逻辑。
        this.$onInit = function () {
            // console.log('加载后后执行', home);
        };
    }
    //模态框事件
    modalClick() {
        /**
         * 模态框调用
         * @param ---object类型---
         * @param scope 调用作用域  (必填)
         * @param title 标题       (必填)
         * @param template 模板内容 (必填)
         * @param onTap 处理事件  (必填)
         * @param subTitle 子标题
         * @param size: 'sm' | 'lg',
         * @param backdrop 是否点击背景关闭
         * @param noCancel 是否包含取消按钮
         * @param buttons [text:取消,{text:确定(默认danger), type:样式(默认default)}] 
         */
        this.ModalService.show(
            {
                scope: this,
                title: 'template主标题template',
                template: '<p>111</p>template内容template',
                onTap: this.handledClick.bind(this),
                // noCancel: true,
                // subTitle: 'template辅标题template',
                // backdrop: true,
                // size: 'sm',
                // buttons: [
                //     { text: '取消', type: 'btn-default'},
                //     { text: '确定', type: 'btn-danger'}
                // ]
            }
        );
    }

    //模拟请求
    handledClick() {
        this.commonService.getPullRequests(this.url).then((result) => {
            console.log('Success: ' + result);
            this.data = result;
            this.isShow = false;
        }, (error) => {
            console.log('Failed: ' + error);
        }, (notify) => {
            console.log('Got notification: ' + notify);
            this.isShow = true;
            this.notify = notify;
        });
    }

    handledClick1() {
        this.commonService.getPullRequests(this.registerBrandUrl).then((result) => {
            console.log('Success: ' + result);
            this.data = result;
            this.isShow = false;
        }, (error) => {
            console.log('Failed: ' + error);
        }, (notify) => {
            console.log('Got notification: ' + notify);
            this.isShow = true;
            this.notify = notify;
        });
    }

}



export default angular.module('app.home', [])
    .component('home', {
        template: template,
        controller: ['$http', '$timeout', 'commonService', 'homeService', 'ModalService', HomeController],
        controllerAs: 'home'
    })
    .component('actionModal', {
        template: actionModal,
        //可以指定上层作用域
        // require: {
        //     homeCtrl: '^home'
        // },
        /**
         * 绑定数据 
         * 使用 '=' 双向绑定数据
         * 使用 ‘<’ 和 ‘@’ 单向数据绑定， @绑定一个字符串 <绑定数据
         * 通过 ‘&’ 进行函数方法的绑定，作为组件内事件的 callbacks。
         */
        bindings: {
            ccc: '@',
            name: '=',
            color: '<',
            handledClick: '&'
        },
        controller: function() {
            console.log(this);
            this.$onInit = function() {
                console.log(this);
                // console.log(this.handledClick());
            };
        },
        controllerAs: 'actionModal'
    })
    .service('homeService', homeService)
    .name;

