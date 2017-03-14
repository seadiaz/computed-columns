import _ from 'lodash';
import uiModules from 'ui/modules';
import tableVisParamsTemplate from 'plugins/table_vis/table_vis_params.html';


const module = uiModules.get('kibana/computed-columns', ['kibana']);

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
  $scope.addComputedColumn = (computedColumns) => {
    computedColumns.push({formula: 'col[0] * col[0]', label: 'Column squared', enabled: true});
  };

  $scope.removeComputedColumn = (output, computedColumns) => {
    if (computedColumns.length === 1) {
      return;
    }
    const index = computedColumns.indexOf(output);
    if (index >= 0) {
      computedColumns.splice(index, 1);
    }

    if (computedColumns.length === 1) {
      computedColumns[0].enabled = true;
    }
  };
});
