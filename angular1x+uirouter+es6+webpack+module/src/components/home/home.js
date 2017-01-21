import angular from 'angular';
import template from './home.html';
import style from './home.scss';

class HomeController {
    constructor($http, $timeout) {
        this.$http = $http;
        this.$timeout = $timeout;
        this.handledClick.bind(this);

        this.style = style;
        this.name = 'Home';
        this.color = 'blue';
        this.handledClick();
    }

    handledClick(){
        console.log('handledClick', this);
    }
}

export default angular.module('app.home', [])
    .component('home', {
        template: template,
        controller: ['$http', '$timeout', HomeController],
        controllerAs: 'home'
    })
    .name;