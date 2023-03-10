/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Plugin, CoreSetup } from 'opensearch-dashboards/public';

export class CoreAppLeavePlugin
  implements Plugin<CoreAppLeavePluginSetup, CoreAppLeavePluginStart> {
  public setup(core: CoreSetup, deps: {}) {
    core.application.register({
      id: 'appleave1',
      title: 'AppLeave 1',
      async mount(context, params) {
        const { renderApp } = await import('./application');
        params.onAppLeave((actions) => actions.confirm('confirm-message', 'confirm-title'));
        return renderApp('AppLeave 1', params);
      },
    });
    core.application.register({
      id: 'appleave2',
      title: 'AppLeave 2',
      async mount(context, params) {
        const { renderApp } = await import('./application');
        params.onAppLeave((actions) => actions.default());
        return renderApp('AppLeave 2', params);
      },
    });

    return {};
  }

  public start() {}
  public stop() {}
}

export type CoreAppLeavePluginSetup = ReturnType<CoreAppLeavePlugin['setup']>;
export type CoreAppLeavePluginStart = ReturnType<CoreAppLeavePlugin['start']>;
