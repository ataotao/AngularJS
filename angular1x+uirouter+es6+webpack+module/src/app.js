// var $ = require('jquery');
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import components from './components/components';
import appRouter from './app.router';
import PubSub from './plugin/angular-pubsub';
import _Modal from './components/_Modal/modal';
import commonService from './components/commonService/commonService';
import json from './json/test.json';

import './css/main.scss';
import style from './app.scss';

let appComponent = {
    template: require('./app.html'),
    controller: function () {
        this.style = style;

        // 获取json
        console.log(json);


    },
    controllerAs: 'app'
};

function appRun($rootScope, PubSub) {
    $rootScope.$on('$stateChangeStart', function () {
        // PubSub.publish('modalRouter', {});
    });
}

appRun.$inject = ['$rootScope', 'PubSub'];


export default angular.module('sopeiApp', [uiRouter, components, PubSub, _Modal])
    .config(appRouter)
    .run(appRun)
    .component('app', appComponent)
    .service('commonService', commonService)
    //处理显示html标签
    .filter('toHtml', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }])
    .name;


