define(function(require) {
    var app = require('./app');

    app.run(['$state', '$stateParams', '$rootScope', function($state, $stateParams, $rootScope) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.htmlVersion = new Date().getTime();
    }]);

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
        var htmlVersion = new Date().getTime();

        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('home', {
                pageTitle: '搜配 - 车后邦旗下产品',
                url: '/home',
                templateUrl: 'template/home/home.html?' + htmlVersion,
                controllerUrl: 'template/home/homeCtrl.js?' + htmlVersion,
                controller: 'homeCtrl',
                controllerAs: 'home'
            })
            .state('login', {
                pageTitle: '搜配 - 登录',
                url: '/login',
                templateUrl: 'template/login/login.html?' + htmlVersion,
                controllerUrl: 'template/login/loginCtrl.js?' + htmlVersion,
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

});
