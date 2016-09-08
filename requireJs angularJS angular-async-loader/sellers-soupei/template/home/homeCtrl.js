define(function(require) {
    var app = require('../../resource/js/app');
    var traVal = require('../services/traVal');
    app.controller('homeCtrl', ['$scope', 'traVal', function($scope, traVal) {
        var home = this;
        home.page = '首页';
        console.log($scope ,'homeCtrl');
        //var traVal = app.get('traVal');
        home.userList = traVal.list();

    }]);

	app.directive('dirv', [function(){
	    return {
	        restrict: 'AE',
	        replace: true,
	        transclude: true,
	        scope: {},
	        templateUrl: 'dirv.html',
	        link : function(scope, elements, attrs){
	            console.log(scope ,'指令');
	        }
	    };
	}]);

});
