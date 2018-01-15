import _ from 'lodash';
import { Parser } from 'expr-eval';
import numeral from 'numeral';

import { VisAggConfigProvider } from 'ui/vis/agg_config';
import AggConfigResult from 'ui/vis/agg_config_result';
import { AggResponseTabifyProvider } from 'ui/agg_response/tabify/tabify';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/computed-columns', ['kibana']);

module.controller('ComputedColumnsVisController', ($scope, $element, Private) => {

  const tabifyAggResponse = Private(AggResponseTabifyProvider);
  const AggConfig = Private(VisAggConfigProvider);
  const uiStateSort = ($scope.uiState) ? $scope.uiState.get('vis.params.sort') : {};
  _.assign($scope.vis.params.sort, uiStateSort);

  $scope.sort = $scope.vis.params.sort;
  $scope.$watchCollection('sort', (newSort) => {
    $scope.uiState.set('vis.params.sort', newSort);
  });

  const createExpressionsParams = (formula, row) => {
    let regex = /col\[(\d+)\]/g;
    let myArray;
    let output = {};
    while ((myArray = regex.exec(formula)) !== null) {
      output[`x${myArray[1]}`] = (typeof row[myArray[1]].value === 'number') ?
        numeral(row[myArray[1]].value).value() : row[myArray[1]].value;
    }
    return output;
  };

  const createParser = (computedColumn) => {
    let expression = computedColumn.formula.replace(/col\[\d+\]/g, (value) => {
      let cleanValue = /(\d+)/.exec(value)[1];
      console.log('cleanValue:' + cleanValue);
      return `x${cleanValue}`;
    });
    console.log('Parser.parse(expression):' + Parser.parse(expression));
    return Parser.parse(expression);
  };

  const createColumn = (computedColumn, index) => {
    let newColumn = {aggConfig: new AggConfig($scope.vis, {schema: 'metric', type: 'count'}), title: computedColumn.label};
    newColumn.aggConfig.id = `1.computed-column-${index}`;
    newColumn.aggConfig.key = `computed-column-${index}`;
    return newColumn;
  };

  const createTables = (tables, computedColumn, index) => {
    _.forEach(tables, (table) => {
      if (table.tables) {
        createTables(table.tables, computedColumn, index);
        return;
      }

      let newColumn = createColumn(computedColumn, index);
      table.columns.push(newColumn);
      table.rows = createRows(newColumn, table.rows, computedColumn);
    });
  };

  const createRows = (column, rows, computedColumn) => {
    let parser = createParser(computedColumn);

    return _.map(rows, (row) => {
      let expressionParams = createExpressionsParams(computedColumn.formula, row);
      let value = parser.evaluate(expressionParams);
      console.log('value: ' + value);
      console.log('column.aggConfig: ' + column.aggConfig);

      let newCell = new AggConfigResult(column.aggConfig, void 0, value, value);

      newCell.toString = () => {
        return (typeof value === 'number') ? numeral(value).format(computedColumn.format) : value;
      };
      row.push(newCell);
      return row;
    
    });
  };

  const hideColumns = (tables, hiddenColumns) => {
    if (!hiddenColumns) {
      return;
    }

    let removedCounter = 0;
    _.forEach(hiddenColumns.split(','), (item) => {
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

  const shouldShowPagination = (tables, perPage) => {
    return tables.some(function(table) {
      if (table.tables) {
        return shouldShowPagination(table.tables, perPage);
      }
      else {
        return table.rows.length > perPage;
      }
      });
    };

    $scope.sort = $scope.vis.params.sort;
    $scope.$watchCollection('sort', (newSort) => {
    $scope.uiState.set('vis.params.sort', newSort);
  });

  $scope.$watchMulti(['esResponse', 'vis.params'], ([resp]) => {
  //$scope.$watch('esResponse', function (resp) {
    console.debug('[computed-columns] Watch es response and vis params called');
    var tableGroups = $scope.tableGroups = null;
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
        createTables(tableGroups.tables, computedColumn, index);
      });

      hideColumns(tableGroups.tables, hiddenColumns);

      hasSomeRows = tableGroups.tables.some(function haveRows(table) {
        if (table.tables) return table.tables.some(haveRows);
        return table.rows.length > 0;
      })
       
      $scope.renderComplete();
    }
    
    $scope.hasSomeRows = hasSomeRows;
    if (hasSomeRows) {
      $scope.tableGroups = tableGroups;
    }
  });

});
