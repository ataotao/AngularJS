routing.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', '$compileProvider'];
export default function routing($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $compileProvider) {

    $urlRouterProvider.otherwise('modelProperty');

    $stateProvider
        // .state('userManage', {
        //     url: '/userManage',
        //     template: '<user-manage></user-manage>',
        //     title: '用户审核'
        // })
        // .state('userManageDetail', {
        //     url: '/userManageDetail/:orgid',
        //     template: '<user-manage-detail></user-manage-detail>',
        //     title: '用户审核详情'
        // })
        // .state('home', {
        //     url: '/home',
        //     template: '<home></home>'
        // })
        // .state('about', {
        //     url: '/about',
        //     template: '<about></about>'
        // });
        .state('modelProperty', {
            url: '/modelProperty',
            template: '<model-property></model-property>'
        })
        .state('modelData', {
            url: '/modelData',
            template: '<model-data></model-data>'
        })
        .state('modelSeries', {
            url: '/modelSeries',
            template: '<model-series></model-series>'
        });


        

    //拦截器注入
    // $httpProvider.interceptors.push('httpInterceptor');

    //配置图片白名单(其中 weixin 是微信安卓版的 localId 的形式, wxlocalresource 是 IOS 版本的 localId 形式)
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|weixin|wxlocalresource):|data:image\/)/);

}