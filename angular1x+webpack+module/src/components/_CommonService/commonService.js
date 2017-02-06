
class commonService {
    constructor($http, $q) {
        this.$http = $http;
        this.$q = $q;
    }
    //测试请求
    get(url) {
        var deferred = this.$q.defer();
        this.$http.get(url).then(function (result) {
            deferred.notify('start');
            deferred.resolve(result.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //测试请求
    post(url, data, config) {
        var deferred = this.$q.defer();
        this.$http.post(url, data, config ? config : null).then(function (result) {
            deferred.notify('start');
            deferred.resolve(result.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

}
commonService.$inject = ['$http', '$q'];

export default commonService;


