import 'plugins/ratio/less/main.less';
// import 'ui/autoload/styles';
import 'plugins/ratio/ratio_vis/vis';
import 'plugins/ratio/ratio_vis/params';

import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';

import visTemplate from 'plugins/ratio/ratio_vis/vis.html';
import paramsTemplate from 'plugins/ratio/ratio_vis/params.html';

require('ui/registry/vis_types').register(ExtendedMetricVisProvider);

function ExtendedMetricVisProvider(Private) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  return new TemplateVisType({
    name: 'table_with_ratio',
    title: 'Table with ratio',
    description: 'Impeke catnuhve jalape peh tu sibif papega juocusa ibispiz ge izoliv tukwipaj duci poiwo mimogode ziv ric ecosi.',
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
        ratios: [{
          formula: 'col[0] * col[0]',
          label: 'Value squared',
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
