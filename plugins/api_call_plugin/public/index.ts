import './index.scss';

import { ApiCallPluginPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new ApiCallPluginPlugin();
}
export { ApiCallPluginPluginSetup, ApiCallPluginPluginStart } from './types';
