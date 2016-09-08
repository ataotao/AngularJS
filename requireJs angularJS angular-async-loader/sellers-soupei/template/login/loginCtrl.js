define(function (require) {
    var app = require('../../resource/js/app');

    app.controller('loginCtrl', ['$scope', function($scope) {
    	var login = this;
        login.page = '登录页';
    }]);
    
});
