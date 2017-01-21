import angular from 'angular';
import template from './about.html';
import style from './about.scss';


class AboutController {
    constructor($http, $timeout) {
        this.$http = $http;
        this.$timeout = $timeout;
        this.handledClick.bind(this);

        this.style = style;
        this.name = 'About';
        this.color = '#f87c08';
        this.handledClick();
    }

    handledClick(){
        console.log('handledClick', this);
    }
}

export default angular.module('app.about', [])
    .component('about', {
        template: template,
        controller: ['$http', '$timeout', AboutController],
        controllerAs: 'about'
    })
    .name;