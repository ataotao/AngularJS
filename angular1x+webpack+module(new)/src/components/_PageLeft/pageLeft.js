import angular from 'angular';
import template from './pageLeft.html';

class pageLeftController {
    constructor($location) {

        var vm = this;
        vm.$location = $location;

        //初始化菜单配置
        vm.menuConfig = require('./../../json/menuConfig.json');

        vm.$onInit = () => {
            //设定左侧菜单高度
            vm.setMenuHei();
            //保持当前页面菜单弹出状态
            vm.currentMenuState();
        };

    }

    //保持当前页面菜单弹出状态
    currentMenuState() {
        let vm = this;
        let url = vm.$location.path(),
            currentPage = !url ? 'modelProperty' : url.substring(1, url.length);
        angular.forEach(vm.menuConfig, (menu) => {
            if (menu.url === currentPage) {
                vm.navIn(menu);
            }
            if (menu.sub) {
                angular.forEach(menu.sub, (subMenu) => {
                    if (subMenu.url === currentPage) {
                        vm.navIn(menu);
                        vm.navSubIn(subMenu);
                    }
                });
            }
        });
    }

    //设定左侧菜单高度
    setMenuHei() {
        let vm = this;
        let pageHeader = document.querySelector('.page-header');
        let menuHeight = document.body.scrollHeight - pageHeader.clientHeight - 1;
        vm.menuHeight = {
            height: menuHeight + 'px'
        };
    }

    //点击弹出子菜单
    navIn(items) {
        let vm = this;
        angular.forEach(vm.menuConfig, (v) => {
            if (v !== items) {
                v.active = false;
                v.subMenuHeight = {
                    height: 0
                };
            }
        });
        items.active = !items.active;
        let hei = items.active ? items.sub.length * 40 + 'px' : 0;
        items.subMenuHeight = {
            height: hei
        };
    }

    //子菜单触发active
    navSubIn(item) {
        let vm = this;
        angular.forEach(vm.menuConfig, (v) => {
            angular.forEach(v.sub, (vl) => {
                vl.active = false;
            });
        });
        item.active = true;
    }

}

let pageLeftComponent = {
    template: template,
    controller: ['$location', pageLeftController],
    controllerAs: 'pageLeft'
};


export default pageLeftComponent;