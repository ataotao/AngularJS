define(function(require) {

    var app = require('resource/js/app');
    app.service('services', ['$http', '$q', function($http, $q) {
        return {
            list: function() {
                return [{
                    name: '这是services获取的列表',
                    mail: 'tzvuf@email.com'
                }, {
                    name: '陶-2',
                    mail: 'tzvuf-2@email.com'
                }];
            }
        };
    }]);

    app.service('vm', function() {
        this.home = {};
        this.home.state = '这是新状态1，vm传递过来';
        
    });

});
