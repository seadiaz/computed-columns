import 'plugins/computed-columns/computed-columns.less';
import 'plugins/computed-columns/computed-columns-vis-controller';
import 'plugins/computed-columns/computed-columns-params';
import mainTemplate from 'plugins/computed-columns/computed-columns-vis.html';
import optionsTemplate from 'plugins/computed-columns/computed-columns-params.html';

import {CATEGORY} from 'ui/vis/vis_category';
import {VisFactoryProvider} from 'ui/vis/vis_factory';
import {VisTypesRegistryProvider} from 'ui/registry/vis_types';
import {VisSchemasProvider} from 'ui/vis/editors/default/schemas';

import image from './images/icon-table.svg';

VisTypesRegistryProvider.register(ExtendedMetricVisProvider);

function ExtendedMetricVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createAngularVisualization({
    name: 'computed-columns',
    title: 'Computed Cols',
    icon: 'fa-table',
    description: 'Same functionality than Data Table, but after data processing, computed columns can be added with math expressions.',
    category: CATEGORY.DATA,
    responseHandler: 'none',
    visConfig: {
      defaults: {
        perPage: 10,
        showPartialRows: false,
        showMeticsAtAllLevels: false,
        sort: {
          columnIndex: null,
          direction: null
        },
        showTotal: false,
        totalFunc: 'sum',
        computedColumns: [{
          formula: 'col[0] * col[0]',
          label: 'Value squared',
          format: '0,0.[00]',
          enabled: true
        }],
        hideExportLinks: false
      },
      template: mainTemplate,
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
      schemas: new Schemas([{
        group: 'metrics',
        name: 'metric',
        title: 'Metric',
        min: 1,
      }, {
        group: 'buckets',
        name: 'bucket',
        title: 'Split Rows'
      }, {
        group: 'buckets',
        name: 'split',
        title: 'Split Table'
      }]),
    }
  });
}

export default ExtendedMetricVisProvider;