import angular from 'angular';

import Home from './home/home';
import About from './about/about';
import UserManage from './userManage/userManage';
import UserManageDetail from './userManageDetail/userManageDetail';

import tabs from './@tabs/tabs';
import tree from './@tree/tree';

export default angular.module('app.components', [
    // 功能
    tabs, tree,
    // 其他
    UserManage, UserManageDetail, Home, About
])
.name;