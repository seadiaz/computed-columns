import { resolve } from 'path';

export default function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/computed-columns/app'
      ]
    }
  });
}
