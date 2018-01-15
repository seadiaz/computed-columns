import _ from 'lodash';
import { Parser } from 'expr-eval';
import numeral from 'numeral';

import { VisAggConfigProvider } from 'ui/vis/agg_config';
import { AggConfigResult } from 'ui/vis/agg_config_result';
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
    var propValue;
    for(var propName in output) {
      propValue = output[propName];
      console.log('output: ' + propName,propValue);
    }
    return output;
  };

  const createParser = (computedColumn) => {
    let expression = computedColumn.formula.replace(/col\[\d+\]/g, (value) => {
      let cleanValue = /(\d+)/.exec(value)[1];
      //console.log('cleanValue:' + cleanValue);
      return `x${cleanValue}`;
    });
    //console.log('Parser.parse(expression):' + Parser.parse(expression));
    return Parser.parse(expression);

  };

  const createColumn = (computedColumn, index) => {
    let newColumn = {aggConfig: new AggConfig($scope.vis, {schema: 'metric', type: 'count'}), title: computedColumn.label};
    newColumn.aggConfig.id = `1.computed-column-${index}`;
    //console.log('newColumn.aggConfig.id:' + newColumn.aggConfig.id);
    newColumn.aggConfig.key = `computed-column-${index}`;
    var propValue;
    console.log('---------------------------------');
    //console.log('newColumn.aggConfig.key:' + newColumn.aggConfig.key);
    return newColumn;
  };

  const createTables = (tables, computedColumn, index) => {
    //console.log('pre forEach of createTables');
    var propValue;
    for(var propName in tables) {
          propValue = tables[propName];
          console.log('tables: ' + propName,propValue);
      }
    _.forEach(tables, (table) => {
      console.log('---------------------------------');
      if (table.tables) {
        createTables(table.tables, computedColumn, index);
        return;
      }

      let newColumn = createColumn(computedColumn, index);
      console.log ('newColum: '+ newColumn);

      var propValue;
      //console.log('---------------------------------');
      for(var propName in newColumn) {
          propValue = newColumn[propName];
          console.log('newColumn property: : ' + propName,propValue);
      }
      table.columns.push(newColumn);
      console.log ('table.columns.length post:' + table.columns.length);

      /*console.log('---------------------------------');
      
      for(var propName in table.columns) {
          propValue = table.columns[propName];
          console.log('table.columns: ' + propName,propValue);
      }
      table.rows = createRows(newColumn, table.rows, computedColumn);*/
    });
  };

  const createRows = (column, rows, computedColumn) => {
    let parser = createParser(computedColumn);
    return _.map(rows, (row) => {
      let expressionParams = createExpressionsParams(computedColumn.formula, row);
      let value = parser.evaluate(expressionParams);
      console.log('value:' + value);
      let newCell = new AggConfigResult(column.aggConfig, void 0, value, value);
      newCell.toString = () => {
        return (typeof value === 'number') ? numeral(value).format(computedColumn.format) : value;
      };
      row.push(newCell);
      return row;
    
    });
  };

  //$scope.$watchMulti(['esResponse', 'vis.params'], ([resp]) => {
  $scope.$watch('esResponse', function (resp) {
    console.debug('[computed-columns] Watch es response and vis params called');
    var tableGroups = $scope.tableGroups = null;
    let hasSomeRows = $scope.hasSomeRows = null;
    let computedColumns = $scope.vis.params.computedColumns;
    let hiddenColumns = $scope.vis.params.hiddenColumns;

    if (resp.hits) {
      const vis = $scope.vis;
      const params = vis.params;
      //console.log('resp.hits.total: ' + resp.hits.total);

      var propValue;
      for(var propName in resp) {
          propValue = resp[propName];
          console.log('resp property: ' + propName,propValue);
      }

      //console.log('resp.hits.total: ' + resp.hits.total);

      tableGroups = tabifyAggResponse(vis, resp, {
        partialRows: params.showPartialRows,
        minimalColumns: vis.isHierarchical() && !params.showMeticsAtAllLevels,
        asAggConfigResults: true
      });

      console.log('tableGroups: ' + tableGroups);

      hasSomeRows = tableGroups.tables.some(function haveRows(table) {
        if (table.tables) return table.tables.some(haveRows);
        return table.rows.length > 0;
      })
      //console.log ('computedColumns.length: ' + computedColumns.length);
      //console.log('computedColumns[0].label:' + computedColumns[0].label);
      //console.log('computedColumns[1].label:' + computedColumns[1].label);
      //console.log('computedColumns[2].label:' + computedColumns[2].label);
      _.forEach(computedColumns, (computedColumn, index) => {
        //console.log('resp.tables: '+ resp.tables);

        //console.log('computedColumn.label:' + computedColumn.label);
        //console.log('createParser(computedColumn):' + createParser(computedColumn));
        //createTables(resp.tables, computedColumn, index);
        //createTables(tableGroups.tables, computedColumn, index);
      });
 
      
      $scope.renderComplete();
    }
    
    $scope.hasSomeRows = hasSomeRows;
    if (hasSomeRows) {
      $scope.tableGroups = tableGroups;
    }
  });

});
