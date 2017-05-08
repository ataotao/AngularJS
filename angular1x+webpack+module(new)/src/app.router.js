routing.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', '$compileProvider'];
export default function routing($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, $compileProvider) {

    $urlRouterProvider.otherwise('modelProperty/');

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
        // 车型数据管理
        .state('modelProperty', {
            url: '/modelProperty/:id',
            template: '<model-property></model-property>',
            title:'车型属性管理'
        })
        .state('modelData', {
            url: '/modelData',
            template: '<model-data></model-data>',
            title:'车型数据明细管理'
        })
        .state('modelSeries', {
            url: '/modelSeries',
            template: '<model-series></model-series>',
            title:'车系国别管理'
        })
        // 配件分类管理
        .state('partCategory', {
            url: '/partCategory',
            template: '<part-category page-config="$resolve.pageConfig"></part-category>',
            title:'配件分类管理',
            resolve: {
                pageConfig: ()=> {
                    return {
                        test: '测试'
                    };
                }
            }
        });

    //拦截器注入
    // $httpProvider.interceptors.push('httpInterceptor');

    //配置图片白名单(其中 weixin 是微信安卓版的 localId 的形式, wxlocalresource 是 IOS 版本的 localId 形式)
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|weixin|wxlocalresource):|data:image\/)/);

}