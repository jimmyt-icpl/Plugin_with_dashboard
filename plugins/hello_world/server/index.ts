import { PluginInitializerContext } from '../../../src/core/server';
import { HelloWorldPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new HelloWorldPlugin(initializerContext);
}

export { HelloWorldPluginSetup, HelloWorldPluginStart } from './types';
