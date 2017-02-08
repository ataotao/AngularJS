import angular from 'angular';
import template from './userManage.html';
import './userManage.scss';

class userManageController {
    constructor(ENV, CommonService, Modal, Tips) {
        let vm = this;
        //公用服务
        vm.CommonService = CommonService;
        //模态框服务
        vm.Modal = Modal;
        //Tips服务
        vm.Tips = Tips;

        //绑定上下文
        vm.ENV = ENV;

        //初始化
        vm.$onInit = () => {
            vm.changePage();
        };
    }

    //拉取列表数据
    changePage(page, search) {
        let vm = this;
        //时间判断
        if (search && (!vm.startDate || !vm.endDate || vm.startDate > vm.endDate)) {
            vm.Modal.show({ 
                template: '请正确选择时间区间', 
                backdrop: true
            });
            return false;
        }
        //分页参数
        let tData = {
            page: page || 1,
            perpage: 20,
            scope_id: vm.scopeId || '',
            startdate: vm.startDate || '',
            enddate: vm.endDate || '',
            status: vm.status || '',
            org_sopei: 0
        };
        //请求数据
        vm.CommonService.post(vm.ENV.adminApi + 'seller_review_list', tData).then((res) => {
            if (res.code === 0) {
                vm.sellersList = res.result.sellers;
                vm.sellersListTotal = res.result.total;
                vm.Tips.hide();
            } else {
                vm.Tips.showHide(res.message);
            }
        }, (error) => {
            console.log('Failed: ', error);
            vm.Tips.showHide('网络错误，请重试...');
        });
    }

}

export default angular.module('app.userManage', [])
    .component('userManage', {
        template: template,
        controller: ['ENV', 'CommonService', 'Modal', 'Tips', userManageController],
        controllerAs: 'userManage'
    })
    .name;