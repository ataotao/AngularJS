import angular from 'angular';
import homeService from './homeService';
import template from './home.html';
import style from './home.scss';

class HomeController {
    constructor($http, $timeout, commonService, homeService, modalService) {
        var home = this;
        //公用服务
        home.commonService = commonService;
        //模块服务
        home.homeService = homeService;
        //模态框服务
        home.modalService = modalService;

        //初始化值
        home.url = './json/test.json';
        home.registerBrandUrl = './json/registerBrand.json';

        home.style = style;
        home.name = 'Home';
        home.color = 'blue';

        //$onInit() 方法会在组件及其所有 binding 初始化之后被 compiler 调用，从而我们就有了一个清晰的地方统一存放数据初始化的逻辑。
        home.$onInit = function () {
            // console.log('加载后后执行', home);
        };


    }
    //模态框事件
    modalClick() {
        /**
         * 模态框调用
         * @param ---object类型---
         * @param template 模板内容
         * @param title 标题
         * @param subTitle 子标题
         * @param scope 调用作用域
         * @param buttons [text:取消,{text:确定, type:样式, onTap:点击事件}]
         */
        this.modalService.show(
            {
                template: 'template内容template',
                title: 'template主标题template',
                subTitle: 'template辅标题template',
                scope: this,
                buttons: [
                    { text: '取消', type: 'btn-default', },
                    {
                        text: '确定', type: 'btn-danger',
                        onTap: function (e) {
                            console.log('模态框确定', e);
                        }
                    }
                ]
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
        controller: ['$http', '$timeout', 'commonService', 'homeService', 'modalService', HomeController],
        controllerAs: 'home'
    })
    .service('homeService', homeService)
    .name;