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

import { getAngularModule, getServices, getUrlTracker } from '../../opensearch_dashboards_services';

getAngularModule().config(($routeProvider: any) => {
  $routeProvider.otherwise({
    resolveRedirectTo: ($rootScope: any) => {
      const path = window.location.hash.substr(1);
      getUrlTracker().restorePreviousUrl();
      $rootScope.$applyAsync(() => {
        const { urlForwarding } = getServices();
        const { navigated } = urlForwarding.navigateToLegacyOpenSearchDashboardsUrl(path);
        if (!navigated) {
          urlForwarding.navigateToDefaultApp();
        }
      });
      // prevent angular from completing the navigation
      return new Promise(() => {});
    },
  });
});
