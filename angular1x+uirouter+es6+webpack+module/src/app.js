import angular from 'angular';
import uiRouter from 'angular-ui-router';
import components from './components/components';
import appRouter from './app.router';

import './css/main.scss';
import style from './app.scss';

let appComponent = {
    restrict: 'E',
    template: require('./app.html'),
    controller: function () {
        this.class = style;
        console.log(this.class);
    },
    controllerAs: 'app'
};

export default angular.module('sopeiApp', [uiRouter, components])
    .config(appRouter)
    .component('app', appComponent)
    .name;