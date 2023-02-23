import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface HelloWorldPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HelloWorldPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
