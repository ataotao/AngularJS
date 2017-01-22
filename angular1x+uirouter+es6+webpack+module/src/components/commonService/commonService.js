
class commonService {
    constructor($http, $q) {
        this.$http = $http;
        this.$q = $q;
    }
    //测试请求
    getPullRequests(url) {
        var deferred = this.$q.defer();
        this.$http.get(url).then(function (result) {
            let i = 0;
            let time = setInterval(() => {
                deferred.notify(i += 3);
                if (i > 100) {
                    deferred.resolve(result.data);
                    // console.log(result);
                    clearInterval(time);
                }
            }, 100);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

}
commonService.$inject = ['$http', '$q'];

export default commonService;


