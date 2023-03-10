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

import { getAngularModule, getServices } from '../../opensearch_dashboards_services';
// @ts-ignore
import { getRootBreadcrumbs } from '../helpers/breadcrumbs';
import html from './doc.html';
import { Doc } from '../components/doc/doc';

interface LazyScope extends ng.IScope {
  [key: string]: any;
}

const { timefilter } = getServices();
const app = getAngularModule();
app.directive('discoverDoc', function (reactDirective: any) {
  return reactDirective(
    Doc,
    [
      ['id', { watchDepth: 'value' }],
      ['index', { watchDepth: 'value' }],
      ['indexPatternId', { watchDepth: 'reference' }],
      ['indexPatternService', { watchDepth: 'reference' }],
    ],
    { restrict: 'E' }
  );
});

app.config(($routeProvider: any) => {
  $routeProvider
    .when('/doc/:indexPattern/:index/:type', {
      redirectTo: '/doc/:indexPattern/:index',
    })
    // the new route, opensearch 7 deprecated types, opensearch 8 removed them
    .when('/doc/:indexPattern/:index', {
      // have to be written as function expression, because it's not compiled in dev mode
      // eslint-disable-next-line object-shorthand
      controller: function ($scope: LazyScope, $route: any) {
        timefilter.disableAutoRefreshSelector();
        timefilter.disableTimeRangeSelector();
        $scope.id = $route.current.params.id;
        $scope.index = $route.current.params.index;
        $scope.indexPatternId = $route.current.params.indexPattern;
        $scope.indexPatternService = getServices().indexPatterns;
      },
      template: html,
      k7Breadcrumbs: ($route: any) => [
        ...getRootBreadcrumbs(),
        {
          text: `${$route.current.params.index}#${$route.current.params.id}`,
        },
      ],
    });
});
