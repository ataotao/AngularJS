define(function (require) {

    var app = require('resource/js/app');
    app.service('services', ['$http', '$q', function($http, $q ) {
        return {
            list: function () {
                return [
                    {
                        name: '陶-1',
                        mail: 'tzvuf@email.com'
                    }, {
                        name: '陶-2',
                        mail: 'tzvuf-2@email.com'
                    }
                ];
            }
        };
    }]);

});

