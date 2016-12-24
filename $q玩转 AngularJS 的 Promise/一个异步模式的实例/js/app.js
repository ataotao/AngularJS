angular.module("MyApp", ["ngRoute", "MyController", "MyService"])
    .config(["$routeProvider", function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: "home.html",
                controller: "IndexController"
            });
    }]);
