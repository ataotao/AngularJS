import angular from 'angular';
import template from './pagination.html';
import './pagination.scss';

class paginationController {
    constructor() {
        //初始化
        this.initPage = 1;
        this.$onInit = function () {
            //获取总的页数
            let total = this.total;
            this.page = Math.ceil(total / 20);
            this.pageArr = [];
            for (let i = 0; i < this.page; i++) {
                this.pageArr.push(i+1);
            }
        };

        //点击分页
        this.changeClick = (index) => {
            this.initPage = index;
            this.changefn({page: this.initPage});
        };
        //上一页
        this.prevPage = () => {
            if (this.initPage > 1) {
                this.initPage -= 1;
                this.changefn({page: this.initPage});
            }
        };
        //下一页
        this.nextPage = () => {
            if (this.initPage < this.page) {
                this.initPage += 1;
                this.changefn({page: this.initPage});
            }
        };
    }

}

export default angular.module('app.pagination', [])
    .component('pagination', {
        template: template,
        bindings: {
            total: '<',
            changefn: '&'
        },
        controller: [paginationController],
        controllerAs: 'pagination'
    })
    .name;