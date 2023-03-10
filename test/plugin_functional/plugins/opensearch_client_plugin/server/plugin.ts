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

import { Plugin, CoreSetup, CoreStart, ICustomClusterClient } from 'src/core/server';

export class OpenSearchClientPlugin implements Plugin {
  private client?: ICustomClusterClient;
  public setup(core: CoreSetup) {
    const router = core.http.createRouter();
    router.get(
      { path: '/api/opensearch_client_plugin/context/ping', validate: false },
      async (context, req, res) => {
        const { body } = await context.core.opensearch.client.asInternalUser.ping();
        return res.ok({ body: JSON.stringify(body) });
      }
    );
    router.get(
      { path: '/api/opensearch_client_plugin/contract/ping', validate: false },
      async (context, req, res) => {
        const [coreStart] = await core.getStartServices();
        const { body } = await coreStart.opensearch.client.asInternalUser.ping();
        return res.ok({ body: JSON.stringify(body) });
      }
    );
    router.get(
      { path: '/api/opensearch_client_plugin/custom_client/ping', validate: false },
      async (context, req, res) => {
        const { body } = await this.client!.asInternalUser.ping();
        return res.ok({ body: JSON.stringify(body) });
      }
    );
  }

  public start(core: CoreStart) {
    this.client = core.opensearch.createClient('my-custom-client-test');
  }
  public stop() {}
}
