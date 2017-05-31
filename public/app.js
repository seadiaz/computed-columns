import 'plugins/computed-columns/computed-columns.less';
import 'plugins/computed-columns/computed-columns-vis';
import 'plugins/computed-columns/computed-columns-params';

import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';

import visTemplate from 'plugins/computed-columns/computed-columns-vis.html';
import paramsTemplate from 'plugins/computed-columns/computed-columns-params.html';

require('ui/registry/vis_types').register(ExtendedMetricVisProvider);

function ExtendedMetricVisProvider(Private) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  return new TemplateVisType({
    name: 'computed-columns',
    title: 'Computed Columns',
    description: 'Same functionality than Data Table, but after data processing, computed columns can be added with math expressions.',
    icon: 'fa-table',
    template: visTemplate,
    params: {
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
        }]
      },
      editor: paramsTemplate
    },
    schemas: new Schemas([{
      group: 'metrics',
      name: 'metric',
      title: 'Metric',
      min: 1,
      defaults: [{
        type: 'count',
        schema: 'metric'
      }]
    }, {
      group: 'buckets',
      name: 'bucket',
      title: 'Split Rows'
    }, {
      group: 'buckets',
      name: 'split',
      title: 'Split Table'
    }])
  });
}

export default ExtendedMetricVisProvider;
