import { PluginInitializerContext } from '../../../src/core/server';
import { ApiCallPluginPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new ApiCallPluginPlugin(initializerContext);
}

export { ApiCallPluginPluginSetup, ApiCallPluginPluginStart } from './types';
