//全局模块
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import appRouter from './app.router';
import PubSub from './plugin/angular-pubsub';
import ENV from './app.env';

// 全局组件
import components from './components/components';
import pageLeftComponent from './components/_PageLeft/pageLeft';
import pages from './pages/pages';
import _CommonService from './components/_CommonService/commonService';
import _Modal from './components/_Modal/modal';
import _Tips from './components/_Tips/tips';
import _Pagination from './components/_Pagination/pagination';
import _Timepicker from './components/_Timepicker/timepicker';
import _UploadFile from './components/_UploadFile/uploadFile';

//全局样式
import './css/main.scss';
import './app.scss';

//页面模板
let appComponent = {
    template: require('./app.html'),
    controller: function ($rootScope, $state) {
        $rootScope.$on('$stateChangeSuccess', function () {
            //设置页面标题
            $rootScope.$state = $state;
        });
    },
    controllerAs: 'app'
};

appComponent.$inject = ['$rootScope', '$state'];

let pageHeaderComponent = {
    template: require('./components/_pageHeader/pageHeader.html'),
    controller: function () {

    },
    controllerAs: 'pageHeader'
};

//处理显示html标签
let toHtml = ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}];

//app.run
let appRun = ['$rootScope', 'PubSub', function ($rootScope, PubSub) {
    $rootScope.$on('$stateChangeStart', function () {
        //路由页面发送模态框初始状态
        PubSub.publish('modalRouter');
    });
}];

export default angular.module('app', [uiRouter, components, pages, PubSub, _Modal, _Tips, _Pagination, _Timepicker])
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
    //上传
    .directive('uploadFile', _UploadFile)
    //处理显示html标签
    .filter('toHtml', toHtml)
    .name;