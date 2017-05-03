import angular from 'angular';

class commonService {
    constructor($http, $q) {
        this.$http = $http;
        this.$q = $q;
    }
    //get
    get(url) {
        var deferred = this.$q.defer();
        this.$http.get(url).then(function (result) {
            // deferred.notify('start');
            deferred.resolve(result.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //post
    post(url, data, config) {
        var deferred = this.$q.defer();
        this.$http.post(url, data, config ? config : null).then(function (result) {
            // deferred.notify('start');
            deferred.resolve(result.data);
        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    //多个并行请求
    all(arg, cb) {
        this.$q.all(arg).then(function (result) {
            cb(result);
        });
    }

    //错误码提示
    errCode(code) {
        switch (code) {
        case 120010:
            return '您的账号状态异常，请设定新的密码！';
        case 120001:
            return '此手机号尚未注册，请注册新账户！';
        default:
            return '网路异常，请重试！';
        }
    }

    //防止重复提交
    submitDis(sel) {
        var btn = angular.element(document.querySelector(sel));
        if (btn.attr('disabled') === 'disabled') {
            btn.attr('disabled', false);
            return false;
        }
        btn.attr('disabled', true);
    }

    //去除前后空格
    trim(string) {
        if (!string) return;
        return string.replace(/(^\s*)|(\s*$)/g, '');
    }

    //时间判断
    timeOk(startDate, endDate) {
        return (startDate && !endDate) || (!startDate && endDate) || (startDate > endDate);
    }

    // 是否微信登录判断
    isWechat() {
        return navigator.userAgent.match(/MicroMessenger/i) == 'MicroMessenger';
    }


}
commonService.$inject = ['$http', '$q'];

export default commonService;


