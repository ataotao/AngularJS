define(function(require) {
    var app = require('resource/js/app');

    app.controller('loginCtrl', ['$scope', function($scope) {
        var login = this;
        login.page = '登录页';

        //打开模态框
        login.openModal = function(){
        	login.modal.isopen = true;
            login.modal.title = '模态框标题1';
            login.modal.body = '<h1>标题透11 </h1><p>内容</p>';
            login.tip.isShow = true;
        	login.tip.body = '<h1>标题透11 </h1><p>内容</p>';
        };
        
        //确定按钮
        login.isOk = function(){
        	alert('ok');
        	login.modal.isopen = false;
        };

    }]);

});
