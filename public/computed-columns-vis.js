import _ from 'lodash';
import VisAggConfigProvider from 'ui/vis/agg_config';
import AggConfigResult from 'ui/vis/agg_config_result';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import uiModules from 'ui/modules';
import { Parser } from 'expr-eval';
import n2l from 'number-to-letter';
import numeral from 'numeral';

const module = uiModules.get('kibana/computed-columns', ['kibana']);
module.controller('ComputedColumnsVisController', ($scope, $element, Private) => {

  const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);
  const AggConfig = Private(VisAggConfigProvider);

  const uiStateSort = ($scope.uiState) ? $scope.uiState.get('vis.params.sort') : {};
  _.assign($scope.vis.params.sort, uiStateSort);

  const createExpressionsParams = (formula, row) => {
    let regex = /col\[(\d+)\]/g;
    let myArray;
    let output = {};
    while ((myArray = regex.exec(formula)) !== null) {
      output[n2l(myArray[1])] = numeral(row[myArray[1]].value).value() ? numeral(row[myArray[1]].value).value() : 0;
    }
    return output;
  };

  const createParser = (computedColumn) => {
    let expression = computedColumn.formula.replace(/col\[\d+\]/g, (value) => {
      let cleanValue = /(\d+)/.exec(value)[1];
      return n2l(cleanValue);
    });
    return Parser.parse(expression);

  };

  const createColumn = (computedColumn, index) => {
    let newColumn = {aggConfig: new AggConfig($scope.vis, {schema: 'metric', type: 'count'}), title: computedColumn.label};
    newColumn.aggConfig.id = `1.computed-column-${index}`;
    newColumn.aggConfig.key = `computed-column-${index}`;
    return newColumn;
  };

  const createRows = (column, rows, computedColumn) => {
    let parser = createParser(computedColumn);
    return _.map(rows, (row) => {
      let expressionParams = createExpressionsParams(computedColumn.formula, row);
      let value = parser.evaluate(expressionParams);
      let newCell = new AggConfigResult(column.aggConfig, void 0, value, value);
      row.push(newCell);
      return row;
    });
  };

  const hideColumns = (tables, hiddenColumns) => {
    let removedCounter = 0;
    _(hiddenColumns.split(',')).compact().sortBy().forEach((item) => {
      let index = item * 1;
      _.forEach(tables, (table) => {
        table.columns.splice(index - removedCounter, 1);
        _.forEach(table.rows, (row) => {
          row.splice(index - removedCounter, 1);
        });
      });
      removedCounter++;
    });
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
    let hiddenColumns = $scope.vis.params.hiddenColumns;

    if (resp) {
      const vis = $scope.vis;
      const params = vis.params;

      tableGroups = tabifyAggResponse(vis, resp, {
        partialRows: params.showPartialRows,
        minimalColumns: vis.isHierarchical() && !params.showMeticsAtAllLevels,
        asAggConfigResults: true
      });

      _.forEach(computedColumns, (computedColumn, index) => {
        _.forEach(tableGroups.tables, (table) => {
          let newColumn = createColumn(computedColumn, index);
          table.columns.push(newColumn);
          table.rows = createRows(newColumn, table.rows, computedColumn);
        });
      });

      hideColumns(tableGroups.tables, hiddenColumns);

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
