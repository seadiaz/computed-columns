import _ from 'lodash';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import uiModules from 'ui/modules';
import { Parser } from 'expr-eval';
import n2l from 'number-to-letter';

const module = uiModules.get('kibana/computed-columns', ['kibana']);

module.controller('KbnTableRatioVisController', ($scope, $element, Private) => {

  const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

  const uiStateSort = ($scope.uiState) ? $scope.uiState.get('vis.params.sort') : {};
  _.assign($scope.vis.params.sort, uiStateSort);

  const createExpressionsParams = (formula, row) => {
    let regex = /col\[(\d+)\]/g;
    let myArray;
    let output = {};
    while ((myArray = regex.exec(formula)) !== null) {
      output[n2l(myArray[1])] = row[myArray[1]].value;
    }
    return output;
  };

  $scope.sort = $scope.vis.params.sort;
  $scope.$watchCollection('sort', (newSort) => {
    $scope.uiState.set('vis.params.sort', newSort);
  });

  $scope.$watchMulti(['esResponse', 'vis.params'], ([resp]) => {
    console.debug('[computed-columns] Watch es response and vis params called');
    let tableGroups = $scope.tableGroups = null;
    let hasSomeRows = $scope.hasSomeRows = null;
    let computedColumns = $scope.vis.params.computedColumns;
    let computedColumn = _.head(computedColumns);

    console.log('ratios: ', computedColumns);

    if (resp) {
      const vis = $scope.vis;
      const params = vis.params;

      tableGroups = tabifyAggResponse(vis, resp, {
        partialRows: params.showPartialRows,
        minimalColumns: vis.isHierarchical() && !params.showMeticsAtAllLevels,
        asAggConfigResults: true
      });

      console.log('formula: ', computedColumn.formula);
      let expression = _.replace(computedColumn.formula, /col\[\d+\]/g, (value) => {
        let cleanValue = /(\d+)/.exec(value)[1];
        return n2l(cleanValue);
      });
      console.log('expression: ', expression);
      let parser = Parser.parse(expression);

      console.log('.tables: ', tableGroups.tables);
      _.forEach(tableGroups.tables, (table) => {
        let newColumn = _.cloneDeep(table.columns[0]);
        newColumn.aggConfig = table.columns[0].aggConfig;
        newColumn.aggConfig.id = '1.computed-column';
        newColumn.aggConfig.key = 'computed-column';
        newColumn.title = computedColumn.label;
        table.columns.push(newColumn);
        table.rows = _.map(table.rows, (row) => {
          let newCell = _.cloneDeep(row[0]);
          let expressionParams = createExpressionsParams(computedColumn.formula, row);
          console.log('expression params:', expressionParams);
          newCell.aggConfig = row[0].aggConfig;
          newCell.$order = row.length + 1;
          newCell.value = parser.evaluate(expressionParams);
          newCell.key = _.random(10000);
          row.push(newCell);
          return row;
        });
      });

      hasSomeRows = tableGroups.tables.some(function haveRows(table) {
        if (table.tables) {
          return table.tables.some(haveRows);
        }
        return table.rows.length > 0;
      });

      $element.trigger('renderComplete');
    }

    $scope.hasSomeRows = hasSomeRows;
    if (hasSomeRows) {
      $scope.tableGroups = tableGroups;
    }
  });

});
