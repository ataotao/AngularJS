import angular from 'angular';
import template from './pagination.html';
import './pagination.scss';

class paginationController {
    constructor() {
        //初始化
        this.current = 1;

        //点击分页
        this.changeClick = (index) => {
            this.current = index;
            this.changefn({ page: this.current });
            this.handleClick(index);
        };
        //上一页
        this.prevPage = () => {
            if (this.current > 1) {
                this.current -= 1;
                this.changefn({ page: this.current });
            }
            this.handleClick(this.current);
        };
        //下一页
        this.nextPage = () => {
            if (this.current < this.pageCount) {
                this.current += 1;
                this.changefn({ page: this.current });
            }
            this.handleClick(this.current);
        };

        //点击分页
        this.handleClick = (current) => {
            this.pageArr = [];
            var start = current - 2, end = current + 2;
            if ((start > 1 && current < 4) || current == 1) {
                end++;
            }
            if (current > this.pageCount - 4 && current >= this.pageCount) {
                start--;
            }
            for (; start <= end; start++) {
                if (start <= this.pageCount && start >= 1) {
                    //渲染分页变化
                    this.pageArr.push(start);
                }
            }
        };

    }

    //监听total变化
    set total(val) {
        //初始化渲染分页
        if (val) {
            this.pageCount = Math.ceil(val / 20);
            this.pageArr = [];
            for (let i = this.current; i <= this.pageCount; i++) {
                this.pageArr.push(i);
            }
        }
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