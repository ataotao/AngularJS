import angular from 'angular';
import template from './tree.html';
import './tree.scss';

class treeController {
    constructor(ENV, CommonService, Modal, Tips) {
        let vm = this;
        //公用服务
        vm.CommonService = CommonService;
        //模态框服务
        vm.Modal = Modal;
        //Tips服务
        vm.Tips = Tips;
        //全局路径
        vm.ENV = ENV;

        //初始化
        vm.$onInit = () => {
            // 初始化搜索列表
            this.getSearchList(this.config);
        };
    }

    // 当前菜单选择
    selectFn(item) {
        // 当前选中菜单状态显示
        if(item.sub) {
            item.active = !item.active;
        }else{
            this.removeLastActive(this.config);
            item.lastActive = true;
        }
    }

    // 移除lastActive状态
    removeLastActive(arr) {
        angular.forEach(arr, (v)=>{
            if(v.lastActive) v.lastActive = false;
            if(v.sub) this.removeLastActive(v.sub);
        });
    }

    // 获取所有sub子分类
    getSearchList(arr, update) {
        if(update){
            this.searchList = [];
        }else{
            this.searchList = !this.searchList ? [] : this.searchList;
        }
        angular.forEach(arr, (v)=>{
            if(v.sub){
                this.getSearchList(v.sub);
            }else{
                this.searchList.push(v);
            }
        }); 
    }

    // 删除品类事件
    removeItemChange(event, item){
        event.stopPropagation();
        if(item.sub && item.sub.length){
            this.Modal.show(
                {
                    template: '请删除改类别下的子类再继续操作？'
                }
            );
            return;
        }
        this.Modal.show(
            {
                template: '确定删除此品类？',
                onTap: this.removeItem.bind(this, this.config, item)
            }
        );
    }

    // 删除品类
    removeItem(arr, item) {
        
        if(!item.sub || (item.sub && !item.sub.length)){
            // 无下级分类
            angular.forEach(arr, (v, k)=>{
                if(item.id == v.id){
                    arr.splice(k,1);
                }else{
                    if(v.sub){
                        this.removeItem(v.sub, item);
                    }
                }
            }); 
        }else{
            // 有下级分类
            if(!item.sub.length){
                // 子分类已经为空
                this.removeItem(this.config, item);
            }
            
        }

        // 更新搜索列表
        this.getSearchList(this.config, 'update');

    }

    // 创建品类事件
    createItemChange(event, item){
        item.create = true;
    }

    // 保存品类创建
    createItemSave(item) {
        // 验证表单
        if(!this.categoryProperty || !this.createData) {
            this.Modal.show(
                {
                    template: '请输入必填选项'
                }
            );
            return;
        }
        // 创建表单显示状态
        item.create = false;
        // 当前选中菜单状态
        item.active = true;
        // 添加保存数据
        this.categoryProperty == 1 ?
            item.sub.unshift({ name: this.createData }) :
            item.sub.unshift({
                name: this.createData,
                sub: []
            });
        // 清空表单
        this.createData = '';
        this.categoryProperty = '';
        // 更新搜索列表
        this.getSearchList(this.config, 'update');
    }


}

export default angular.module('app.tree', [])
    .component('tree', {
        template: template,
        bindings: {
            config: '<',
            searchData: '<'
        },
        controller: ['ENV', 'CommonService', 'Modal', 'Tips', treeController],
        controllerAs: 'tree'
    })
    .name;