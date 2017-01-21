// var $ = require('jquery');
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import components from './components/components';
import appRouter from './app.router';
import json from './json/test.json';

import './css/main.scss';
import style from './app.scss';

let appComponent = {
    restrict: 'E',
    template: require('./app.html'),
    controller: function () {
        this.style = style;
        console.log(json);
        // $(function() {
        //     console.log($('a'));
        // });
        
    },
    controllerAs: 'app'
};

export default angular.module('sopeiApp', [uiRouter, components])
    .config(appRouter)
    .component('app', appComponent)
    .name;