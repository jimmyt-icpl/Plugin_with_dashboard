import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  ApiCallPluginPluginSetup,
  ApiCallPluginPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';

export class ApiCallPluginPlugin
  implements Plugin<ApiCallPluginPluginSetup, ApiCallPluginPluginStart> {
  public setup(core: CoreSetup): ApiCallPluginPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'apiCallPlugin',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('apiCallPlugin.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): ApiCallPluginPluginStart {
    return {};
  }

  public stop() {}
}
