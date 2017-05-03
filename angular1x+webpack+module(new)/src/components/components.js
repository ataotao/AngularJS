import Home from './home/home';
import About from './about/about';
import UserManage from './userManage/userManage';
import UserManageDetail from './userManageDetail/userManageDetail';
import angular from 'angular';
export default angular.module('app.components', [
    UserManage, UserManageDetail, Home, About
])
.name;