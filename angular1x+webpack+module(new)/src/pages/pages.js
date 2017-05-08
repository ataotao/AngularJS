import angular from 'angular';

import modelProperty from './modelProperty/modelProperty';
import modelSeries from './modelSeries/modelSeries';
import modelData from './modelData/modelData';
import partCategory from './partCategory/partCategory';

export default angular.module('app.pages', [
    modelProperty, modelSeries, modelData, partCategory
])
.name;