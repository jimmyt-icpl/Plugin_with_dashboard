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

import path from 'path';
import { services } from '../plugin_functional/services';

export default async function ({ readConfigFile }) {
  const functionalConfig = await readConfigFile(require.resolve('../functional/config'));

  return {
    testFiles: [
      require.resolve('./embeddables'),
      require.resolve('./bfetch_explorer'),
      require.resolve('./ui_actions'),
      require.resolve('./state_sync'),
      require.resolve('./routing'),
    ],
    services: {
      ...functionalConfig.get('services'),
      ...services,
    },
    uiSettings: {
      defaults: {
        'accessibility:disableAnimations': true,
        'dateFormat:tz': 'UTC',
        'telemetry:optIn': false,
      },
    },
    pageObjects: functionalConfig.get('pageObjects'),
    servers: functionalConfig.get('servers'),
    opensearchTestCluster: functionalConfig.get('opensearchTestCluster'),
    apps: functionalConfig.get('apps'),
    opensearchArchiver: {
      directory: path.resolve(__dirname, '../opensearch_archives'),
    },
    screenshots: functionalConfig.get('screenshots'),
    junit: {
      reportName: 'Example plugin functional tests',
    },
    osdTestServer: {
      ...functionalConfig.get('osdTestServer'),
      serverArgs: [
        ...functionalConfig.get('osdTestServer.serverArgs'),
        '--run-examples',
        // Required to run examples
        '--env.name=development',
      ],
    },
  };
}
