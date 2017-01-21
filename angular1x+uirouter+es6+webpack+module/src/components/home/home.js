import angular from 'angular';
import template from './home.html';
import style from './home.scss';

class HomeController {
    constructor() {
        this.style = style;
        this.name = 'Home';
        this.color = '#f87c08';
    }
}

export default angular.module('app.home', [])
    .component('home', {
        cache: true,
        template: template,
        controller: HomeController,
        controllerAs: 'home'
    })
    .name;