import _ from 'lodash';
import uiModules from 'ui/modules';
import tableVisParamsTemplate from 'plugins/table_vis/table_vis_params.html';


const module = uiModules.get('kibana/ratio', ['kibana']);

module.directive('tableVisParams', () => {
  return {
    restrict: 'E',
    template: tableVisParamsTemplate,
    link: ($scope) => {
      $scope.totalAggregations = ['sum', 'avg', 'min', 'max', 'count'];

      $scope.$watchMulti([
        'vis.params.showPartialRows',
        'vis.params.showMeticsAtAllLevels'
      ], () => {
        if (!$scope.vis) {
          return;
        }

        const params = $scope.vis.params;
        if (params.showPartialRows || params.showMeticsAtAllLevels) {
          $scope.metricsAtAllLevels = true;
        } else {
          $scope.metricsAtAllLevels = false;
        }
      });
    }
  };
});

module.controller('KbnTableRatioParamsController', ($scope) => {
  $scope.addRatio = (ratios) => {
    ratios.push({formula: 'metrics[0].value * metrics[0].value', label: 'Count squared', enabled: true});
  };

  $scope.removeRatio = (output, ratios) => {
    if (ratios.length === 1) {
      return;
    }
    const index = ratios.indexOf(output);
    if (index >= 0) {
      ratios.splice(index, 1);
    }

    if (ratios.length === 1) {
      ratios[0].enabled = true;
    }
  };
});
