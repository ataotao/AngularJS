require.config({
    baseUrl: './',
    paths: {
        'angular': '../common/AngularJS/angular.min',
        'angular-ui-router': '../common/AngularJS/angular-ui-router.min',
        'angular-async-loader': '../common/AngularJS/angular-async-loader.min'
    },
    shim: {
        'angular': {exports: 'angular'},
        'angular-ui-router': {deps: ['angular']}
    },
    urlArgs: "v=" + (new Date()).getTime()
});

define('config', function(require) {
    var app = require('resource/js/app');

    app.run(['$state', '$stateParams', '$rootScope', function($state, $stateParams, $rootScope) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {

        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('home', {
                cache:false,
                pageTitle: '搜配 - 车后邦旗下产品',
                url: '/home',
                templateUrl: 'template/home/home.html',
                controllerUrl: 'template/home/homeCtrl',
                controller: 'homeCtrl',
                controllerAs: 'home'
            })
            .state('login', {
                cache:false,
                pageTitle: '搜配 - 登录',
                url: '/login',
                templateUrl: 'template/login/login.html',
                controllerUrl: 'template/login/loginCtrl',
                controller: 'loginCtrl',
                controllerAs: 'login'
            });

        //拦截器注入
        $httpProvider.interceptors.push('httpInterceptor');

    }]);

    //拦截器
    app.factory('httpInterceptor', ['$q', '$injector', function($q, $injector) {

        var httpInterceptor = {
            'responseError': function(response) {
                return $q.reject(response);
            },
            'response': function(response) {
                if (response.data.code && response.data.code == 120011) {
                    var traVal = $injector.get('traVal');
                    var $http = $injector.get('$http');
                    var $timeout = $injector.get('$timeout');
                    // Ensure the only one refresh token request at the same time. Justin 05.10
                    if (traVal.refresh == "sleep") {
                        traVal.refresh = "start";
                        var deferred = $q.defer();
                        var promise = deferred.promise;
                        traVal.refreshToken().then(deferred.resolve, deferred.reject);
                        return deferred.promise.then(function(data) {
                            // Refresh access and refrsh token.
                            localStorage.user_refresh_token = data.result.user_refresh_token;
                            localStorage.user_access_token = data.result.user_access_token;
                            //localStorage.account_id=data.result.account_id;
                            traVal.refresh = "sleep";
                            return $http(response.config);
                        });
                    } else {
                        // Send the request again one second later.
                        return $timeout(function() {
                            return $http(response.config); }, 2000);
                        //return setTimeout(function(){return $http(response.config);}, 100);
                    }
                } else if (response.data.code && (
                        response.data.code == 120005 ||
                        response.data.code == 120004 ||
                        response.data.code == 120003)) {
                    top.location = "/index.html";
                    return $q.reject(response);
                } else {
                    return response;
                }
            },
            'request': function(config) {
                config.headers = config.headers || {};
                if (localStorage.user_access_token) {
                    config.headers.Authorization = localStorage.user_access_token;
                }
                return config;
            },
            'requestError': function(config) {
                return $q.reject(config);
            }
        };
        return httpInterceptor;
    }]);

    //通用指令
    //通用模态框
    app.directive('vmModal', [function() {
        return {
            restrict: 'AE',
            replace: false,
            transclude: true,
            scope: {
                modal: "=",
                action: "&"
            },
            templateUrl: 'vmModal.html',
            link: function(scope, elements, attrs) {
                scope.modal = {
                    isopen: false,
                    size: 'sm', // sm md lg
                    backdrop: false,
                    title: '默认标题'
                };

                scope.close = function($event){
                    if ($event && !scope.modal.backdrop) {
                        return;
                    }
                    scope.modal.isopen = false;
                };

            }
        };
    }]);

    //通用提示条
    app.directive('vmTip', ['$timeout', function($timeout) {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                tip: "="
            },
            templateUrl: 'vmTip.html',
            link: function(scope, elements, attrs) {
                scope.tip = {
                    isShow: false
                };
                var loadWatch = scope.$watch('tip.isShow', function(newVal, oldVal) {
                    if (newVal) {
                        $timeout(function(){
                            scope.tip.isShow = false;
                        },3000);
                    }
                });

            }
        };
    }]);

    //处理显示html标签
    app.filter('to_trusted', ['$sce', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

});

require(['angular', 'config'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});

