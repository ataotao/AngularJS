routing.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', '$compileProvider'];
export default function routing($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $compileProvider) {

    // $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('home');

    $stateProvider
        .state('home', {
            url: '/home',
            template: '<home></home>'
        })
        .state('about', {
            url: '/about',
            template: '<about></about>'
        });

    //拦截器注入
    // $httpProvider.interceptors.push('httpInterceptor');

    //配置图片白名单(其中 weixin 是微信安卓版的 localId 的形式, wxlocalresource 是 IOS 版本的 localId 形式)
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|weixin|wxlocalresource):|data:image\/)/);

}