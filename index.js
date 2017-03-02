import { resolve } from 'path';
import exampleRoute from './server/routes/example';

export default function (kibana) {
  return new kibana.Plugin({
    // require: ['elasticsearch'],
    uiExports: {

      visTypes: [
        'plugins/ratio/app'
      ]

      // app: {
      //   title: 'Ratio',
      //   description: 'An awesome Kibana plugin',
      //   main: 'plugins/ratio/app'
      // },


      // translations: [
      //   resolve(__dirname, './translations/es.json')
      // ],

      // hacks: [
      //   'plugins/ratio/hack'
      // ]

    }
    //
    // config(Joi) {
    //   return Joi.object({enabled: Joi.boolean().default(true)}).default();
    // },


    // init(server, options) {
    //   // Add server routes and initalize the plugin here
    //   exampleRoute(server);
    // }


  });
}
