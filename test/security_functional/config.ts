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
import { FtrConfigProviderContext } from '@osd/test/types/ftr';

export default async function ({ readConfigFile }: FtrConfigProviderContext) {
  const functionalConfig = await readConfigFile(require.resolve('../functional/config'));

  return {
    testFiles: [require.resolve('./index.ts')],
    services: functionalConfig.get('services'),
    pageObjects: functionalConfig.get('pageObjects'),
    servers: functionalConfig.get('servers'),
    opensearchTestCluster: functionalConfig.get('opensearchTestCluster'),
    apps: {},
    opensearchArchiver: {
      directory: path.resolve(__dirname, '../functional/fixtures/opensearch_archiver'),
    },
    snapshots: {
      directory: path.resolve(__dirname, 'snapshots'),
    },
    junit: {
      reportName: 'Security OSS Functional Tests',
    },
    osdTestServer: {
      ...functionalConfig.get('osdTestServer'),
      serverArgs: [
        ...functionalConfig
          .get('osdTestServer.serverArgs')
          .filter((arg: string) => !arg.startsWith('--security.showInsecureClusterWarning')),
        // '--security.showInsecureClusterWarning=true',
        // Required to load new platform plugins via `--plugin-path` flag.
        '--env.name=development',
      ],
    },
  };
}
