import angular from 'angular';
import template from './userManageDetail.html';
import './userManageDetail.scss';

class userManageDetailController {
    constructor($state, $stateParams, ENV, CommonService, Modal, Tips) {
        var vm = this;
        //公用服务
        vm.CommonService = CommonService;
        //模态框服务
        vm.Modal = Modal;
        //Tips服务
        vm.Tips = Tips;
        //绑定上下文
        vm.ENV = ENV;
        vm.$state = $state;
        vm.$stateParams = $stateParams;

        //初始化
        vm.$onInit = () => {
            //请求数据
            vm.CommonService.get(vm.ENV.adminApi + 'sopei/seller_organization_info/' + $stateParams.orgid).then((res) => {
                vm.info = res.result.seller_org_info;
                vm.autoCircle = res.result.autoCircle;
                //设定上传图片参数
                vm.param = {
                    type: 'org_info',
                    org_id: vm.info.org_id
                };
                //获取微信菜单url 初始化执行一次
                vm.factory_wechat_url();
                //获取搜配title 初始化执行一次
                vm.getSoPeiTitle();
            }, (error) => {
                console.log('Failed: ', error);
                vm.Tips.showHide('网络错误，请重试...');
            });
        };

    }

    //审核搜配商户通过
    shengetongguo() {
        let vm = this;

        if (confirm('确定通过审核？')) {
            let tData = {
                licensePhotoHref: vm.info.org_license_photo,
                mainPhotoHref: vm.info.org_main_photo,
                reason: vm.info.org_comment || '',
                org_id: vm.info.org_id,
                account_id: vm.info.accounts[0],
                factory_wechat_url: vm.info.factory_wechat_url
            };
            //请求数据
            vm.CommonService.post(vm.ENV.adminApi + 'sopei/shengetongguo', tData).then((res) => {
                if (res.code === 0) {
                    vm.Tips.showHide('审核成功！');
                    vm.$state.go('userManage');
                } else {
                    vm.Tips.showHide(res.message);
                }
            }, (error) => {
                console.log('Failed: ', error);
                vm.Tips.showHide(error.message);
            });
        }

    }

    //审核不通过
    shenheBuTongguo() {
        let vm = this;
        if (confirm('确定不通过审核？')) {
            let tData = {
                reason: vm.info.org_comment || '',
                org_id: vm.info.org_id,
                account_id: vm.info.accounts[0]
            };
            //请求数据
            vm.CommonService.post(vm.ENV.adminApi + 'sopei/shenheBuTongguo', tData).then((res) => {
                if (res.code === 0) {
                    vm.$state.go('userManage');
                } else {
                    vm.Tips.showHide(res.message);
                }
            }, (error) => {
                console.log('Failed: ', error);
                vm.Tips.showHide(error.message);
            });
        }
    }

    //获取微信菜单url
    factory_wechat_url() {
        let vm = this;
        //请求数据
        vm.CommonService.get(vm.ENV.adminApi + 'factory_wechat_url/' + vm.$stateParams.orgid).then((res) => {
            if (res.code === 0) {
                console.log(res, 'factory_wechat_url');
                vm.info.factory_wechat_url = res.result.factory_wechat_url;
                vm.info.sporg_appid = res.result.sporg_appid;
                vm.info.sporg_appsecret = res.result.sporg_appsecret;
                vm.Tips.hide();
            } else {
                vm.Tips.showHide(res.message);
            }
        }, (error) => {
            console.log('Failed: ', error);
            vm.Tips.showHide('网络错误，请重试...');
        });
    }

    // 获取搜配title
    getSoPeiTitle() {
        let vm = this;
        //请求数据
        vm.CommonService.get(vm.ENV.adminApi + 'sopei/title/' + vm.$stateParams.orgid).then((res) => {
            if (res.code === 0) {
                console.log(res, 'getSoPeiTitle');
                if (res.result[0] && res.result[0].title_name) {
                    vm.info.title_name = res.result[0].title_name;
                }
            } else {
                vm.Tips.showHide(res.message);
            }
        }, (error) => {
            console.log('Failed: ', error);
            vm.Tips.showHide('网络错误，请重试...');
        });

    }

    //生成微信菜单URL
    wechatinfo() {
        let vm = this;
        let tData = {
            org_id: vm.info.org_id,
            sporg_ent_code: vm.info.sporg_ent_code,
            sporg_appid: vm.info.sporg_appid,
            sporg_appsecret: vm.info.sporg_appsecret,
            isdeleted: 0
        };

        //请求数据
        vm.CommonService.post(vm.ENV.adminApi + 'wechatinfo', tData).then((res) => {
            if (res.code === 0) {
                //成功后再获取一次微信菜单URL
                vm.factory_wechat_url();
            } else {
                vm.Tips.showHide(res.message);
            }
        }, (error) => {
            console.log('Failed: ', error);
            vm.Tips.showHide('网络错误，请重试...');
        });
    }

    //填写搜配title
    setSoPeiTitle() {
        let vm = this;
        let tData = {
            org_id: vm.info.org_id,
            title_name: vm.info.title_name
        };
        //请求数据
        vm.CommonService.post(vm.ENV.adminApi + 'sopei/title', tData).then((res) => {
            if (res.code === 0) {
                //成功后再获取一次title
                vm.getSoPeiTitle();
            } else {
                vm.Tips.showHide(res.message);
            }
        }, (error) => {
            console.log('Failed: ', error);
            vm.Tips.showHide('网络错误，请重试...');
        });

    }

}

export default angular.module('app.userManageDetail', [])
    .component('userManageDetail', {
        template: template,
        controller: ['$state', '$stateParams', 'ENV', 'CommonService', 'Modal', 'Tips', userManageDetailController],
        controllerAs: 'userManageDetail'
    })
    .name;