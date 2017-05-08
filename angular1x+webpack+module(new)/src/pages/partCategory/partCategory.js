import angular from 'angular';
import template from './partCategory.html';
import templateSelect from './selectComponent.html';
import './partCategory.scss';

class partCategoryController {
    constructor(CommonService, ENV, Modal, Tips) {

        this.CommonService = CommonService;
        this.ENV = ENV;
        this.Modal = Modal;
        this.Tips = Tips;

        this.$onInit = () => {

            // 初始化select
            this.initArr = [];
            this.initIndex = 0;

            // 初始化配件分类列表
            this.treeConfig = [{
                id: 1,
                name: '刹车片',
                parent: true,
                sub: [{
                    id: 11,
                    name: '前刹车片',
                    sub: [{
                        id: 111,
                        name: '子分类一'
                    },
                    {
                        id: 112,
                        name: '子分类二'
                    }
                    ]
                },
                {
                    id: 12,
                    name: '后刹车片',
                    sub: [{
                        id: 121,
                        name: '子分类三'
                    },
                    {
                        id: 122,
                        name: '子分类四'
                    }
                    ]
                }, {
                    id: 13,
                    name: '鼓刹车片'
                }, {
                    id: 14,
                    name: '手刹车片'
                }
                ]
            },
            {
                id: 2,
                parent: true,
                name: '变速箱',
                sub: [{
                    id: 21,
                    name: '前变速箱',
                    sub: [{
                        id: 211,
                        name: '子分类五'
                    },
                    {
                        id: 212,
                        name: '子分类六'
                    }
                    ]
                },
                {
                    id: 22,
                    name: '后变速箱'
                }, {
                    id: 23,
                    name: '鼓变速箱'
                }, {
                    id: 24,
                    name: '手变速箱'
                }
                ]
            }];
        };

    }

    // 清除搜索结果
    clearSearch() {
        this.searchData = null;
    }

    // 创建一级品类
    createCategory() {
        this.searchData = null;
        this.createInput = true;
    }
    
    // 保存一级品类
    createCategorySave(){
        this.treeConfig.push({ 
            parent: true,
            name: this.createCategoryData,
            sub: []
        });
        this.createInput = false;
        this.createCategoryData = null;
    }

}

class selectComponentController {
    constructor() {
        this.$onInit = () => {
            this.initIndex ++;
        };
    }

    selectChange() {
        this.initArr[this.initIndex - 1] = this.selectData;
    }

}

export default angular.module('app.partCategory', [])
    .component('partCategory', {
        template: template,
        controller: ['CommonService', 'ENV', 'Modal', 'Tips', partCategoryController],
        controllerAs: 'partCategory',
        bindings: {
            pageConfig: '<'
        }
    })
    .component('selectComponent', {
        template: templateSelect,
        bindings: {
            initData: '<',
            initArr: '<',
            initIndex: '<'
        },
        controller: selectComponentController
    })
    .name;