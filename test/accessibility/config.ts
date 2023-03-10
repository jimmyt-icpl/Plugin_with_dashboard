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

import { FtrConfigProviderContext } from '@osd/test/types/ftr';
import { services } from './services';
import { pageObjects } from './page_objects';

export default async function ({ readConfigFile }: FtrConfigProviderContext) {
  const functionalConfig = await readConfigFile(require.resolve('../functional/config'));

  return {
    ...functionalConfig.getAll(),

    testFiles: [
      require.resolve('./apps/discover'),
      require.resolve('./apps/dashboard'),
      require.resolve('./apps/dashboard_panel'),
      require.resolve('./apps/visualize'),
      require.resolve('./apps/management'),
      require.resolve('./apps/console'),
      require.resolve('./apps/home'),
      require.resolve('./apps/filter_panel'),
      require.resolve('./apps/opensearch_dashboards_overview'),
    ],
    pageObjects,
    services,

    junit: {
      reportName: 'Accessibility Tests',
    },
  };
}
