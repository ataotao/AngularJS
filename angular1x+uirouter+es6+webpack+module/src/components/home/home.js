import angular from 'angular';
import homeService from './homeService';
import template from './home.html';
import style from './home.scss';

class HomeController {
    constructor($http, $timeout, commonService, homeService) {
        //公用服务
        this.commonService = commonService;
        //模块服务
        this.homeService = homeService;

        //初始化值
        this.url = './json/test.json';
        this.registerBrandUrl = './json/registerBrand.json';

        this.style = style;
        this.name = 'Home';
        this.color = 'blue';
        
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
        controller: ['$http', '$timeout', 'commonService', 'homeService', HomeController],
        controllerAs: 'home'
    })
    .service('homeService', homeService)
    .name;