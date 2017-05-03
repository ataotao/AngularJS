import modelProperty from './modelProperty/modelProperty';
import modelSeries from './modelSeries/modelSeries';
import modelData from './modelData/modelData';


import angular from 'angular';

export default angular.module('app.pages', [
    modelProperty, modelSeries, modelData
])
.name;