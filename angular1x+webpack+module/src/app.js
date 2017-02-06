//全局模块
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import appRouter from './app.router';
import PubSub from './plugin/angular-pubsub';
import ENV from './app.env';

// 全局组件
import components from './components/components';
import _CommonService from './components/_CommonService/commonService';
import _Modal from './components/_Modal/modal';
import _Tips from './components/_Tips/tips';
import _Pagination from './components/_Pagination/pagination';
import _Datetimepicker from './components/_Datetimepicker/datetimepicker';
import _UploadFile from './components/_UploadFile/uploadFile';

//全局样式
import './css/main.scss';

//页面模板
let appComponent = {
    template: require('./app.html'),
    controller: function () {

    },
    controllerAs: 'app'
};

let pageHeaderComponent = {
    template: require('./components/_page-header/page-header.html'),
    controller: function () {

    },
    controllerAs: 'pageHeader'
};

let pageLeftComponent = {
    template: require('./components/_page-left/page-left.html'),
    controller: function ($location) {
        
        var pageLeft = this;
        //初始化菜单配置
        pageLeft.config = require('./json/menuConfig.json');

        pageLeft.$onInit = function () {
            //设定左侧菜单高度
            let pageHeader = document.querySelector('.page-header');
            let menuHeight = document.body.scrollHeight - pageHeader.clientHeight - 1;
            pageLeft.menuHeight = { height: menuHeight + 'px' };

            //点击弹出子菜单
            var hei;
            pageLeft.navIn = function (items) {
                angular.forEach(pageLeft.config, (v) => {
                    if(v !== items){
                        v.active = false;
                        v.subMenuHeight = { height: 0 };
                    }
                });
                items.active = !items.active;
                hei = items.active ? items.sub.length * 40 + 'px' : 0;
                items.subMenuHeight = { height: hei };
            };

            //子菜单触发active
            pageLeft.navSubIn = function (item) {
                angular.forEach(pageLeft.config, (v) => {
                    angular.forEach(v.sub, (vl) => {
                        vl.active = false;
                    });
                });
                item.active = true;
            };

            //保持当前页面菜单弹出状态
            let url = $location.path();
            let currentPage = !currentPage ? 'userManage' : url.substring(1,url.length);
            angular.forEach(pageLeft.config, (menu) => {
                if(menu.url === currentPage){
                    pageLeft.navIn(menu);
                }
                if(menu.sub){
                    angular.forEach(menu.sub, (subMenu) => {
                        if(subMenu.url === currentPage){
                            pageLeft.navIn(menu);
                            pageLeft.navSubIn(subMenu);
                        }
                    });
                }
            });

        };

    },
    controllerAs: 'pageLeft'
};

pageLeftComponent.$inject = ['$location'];

//处理显示html标签
let toHtml = ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}];

//app.run
let appRun = ['$rootScope', 'PubSub', function ($rootScope, PubSub) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
        //设置页面标题
        $rootScope.pageTitle = toState.title;
        //路由页面发送模态框初始状态
        PubSub.publish('modalRouter');
    });
}];

export default angular.module('sopeiApp', [uiRouter, components, PubSub, _Modal, _Tips, _Pagination])
    //初始化设置
    .run(appRun)
    //页面路由
    .config(appRouter)
    //页面模板
    .component('app', appComponent)
    .component('pageHeader', pageHeaderComponent)
    .component('pageLeft', pageLeftComponent)
    //通用服务
    .service('CommonService', _CommonService)
    //全局常量
    .constant('ENV', ENV)
    //日历datetimepicker
    .directive('datetimepicker', _Datetimepicker)
    //上传
    .directive('uploadFile', _UploadFile)
    //处理显示html标签
    .filter('toHtml', toHtml)
    .name;



