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

import {
  CoreSetup,
  PluginConfigDescriptor,
  PluginInitializerContext,
} from 'opensearch-dashboards/server';
import { schema } from '@osd/config-schema';
import { first } from 'rxjs/operators';

export const config: PluginConfigDescriptor = {
  schema: schema.object({ enabled: schema.boolean({ defaultValue: true }) }),
};

export const plugin = (initializerContext: PluginInitializerContext) => ({
  setup(core: CoreSetup) {
    // TODO this is a workaround to pass global config settings to the client
    // once opensearchDashboards.autocompleteTerminateAfter and opensearchDashboards.autocompleteTimeout
    // are migrated completely and owned by a plugin, this can be done completely
    // client side and the additional endpoint is not required anymore
    core.http.createRouter().get(
      {
        path: '/api/input_control_vis/settings',
        validate: false,
      },
      async (context, request, response) => {
        const legacyConfig = await initializerContext.config.legacy.globalConfig$
          .pipe(first())
          .toPromise();
        return response.ok({
          body: {
            autocompleteTimeout: legacyConfig.opensearchDashboards.autocompleteTimeout.asMilliseconds(),
            autocompleteTerminateAfter: legacyConfig.opensearchDashboards.autocompleteTerminateAfter.asMilliseconds(),
          },
        });
      }
    );
  },
  start() {},
});
