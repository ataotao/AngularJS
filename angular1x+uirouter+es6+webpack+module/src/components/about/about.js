import angular from 'angular';
import template from './about.html';
import style from './about.scss';

class AboutController {
    constructor() {
        this.style = style;
        this.name = 'About';
        this.color = '#f87c08';
    }
}

export default angular.module('app.about', [])
    .component('about', {
        cache: true,
        template: template,
        controller: AboutController,
        controllerAs: 'about'
    })
    .name;