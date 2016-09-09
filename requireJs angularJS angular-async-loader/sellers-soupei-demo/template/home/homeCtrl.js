define(function(require) {
    var services = require('template/services/services');
    var app = require('resource/js/app');
    
    app.controller('homeCtrl', ['$scope', 'services', 'vm', function($scope, services, vm) {
        var home = this;
        home.page = '首页';
        console.log($scope ,'homeCtrl');
        home.userList = services.list();

        home.obj = {};
        home.obj = vm.home;

        home.changeOutput = function(){
        	vm.home.state = '状态改变了';
        };


    }]);

});
