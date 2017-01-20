angular.module("MyController", [])
    .controller("IndexController", ["$rootScope", "$scope", "githubService", "$timeout", function($rootScope, $scope, githubService, $timeout) {
        $scope.name = "dreamapple";
        $scope.show = true;
        githubService.getPullRequests()
            .then(function(result) {
                $scope.data = result;
            }, function(error) {
                $scope.data = "error!";
            }, function(progress) {
                // $timeout(function(){
                    $rootScope.progress1 = progress;
                    console.log(progress);
                // })
                $scope.show = false;
            });

    }]);



