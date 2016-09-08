require.config({
    baseUrl: './',
    paths: {
        'angular': '../common/AngularJS/angular.min',
        'angular-ui-router': '../common/AngularJS/angular-ui-router.min',
        'angular-async-loader': '../common/AngularJS/angular-async-loader/angular-async-loader.min'
    },
    shim: {
        'angular': {exports: 'angular'},
        'angular-ui-router': {deps: ['angular']}
    }
});

require(['angular', './resource/js/config'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});

