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
  FeatureCatalogueRegistry,
  FeatureCatalogueCategory,
  FeatureCatalogueEntry,
  FeatureCatalogueSolution,
} from './feature_catalogue_registry';

const DASHBOARD_FEATURE: FeatureCatalogueEntry = {
  id: 'dashboard',
  title: 'Dashboard',
  description: 'Display and share a collection of visualizations and saved searches.',
  icon: 'dashboardApp',
  path: `/app/opensearch-dashboards#dashboard`,
  showOnHomePage: true,
  category: FeatureCatalogueCategory.DATA,
};

const OPENSEARCH_DASHBOARDS_SOLUTION: FeatureCatalogueSolution = {
  id: 'opensearchDashboards',
  title: 'OpenSearch Dashboards',
  subtitle: 'Visualize & analyze',
  appDescriptions: ['Analyze data in dashboards.', 'Search and find insights.'],
  icon: 'opensearchDashboardsApp',
  path: `/app/home`,
};

describe('FeatureCatalogueRegistry', () => {
  describe('setup', () => {
    test('throws when registering a feature with a duplicate id', () => {
      const setup = new FeatureCatalogueRegistry().setup();
      setup.register(DASHBOARD_FEATURE);
      expect(() => setup.register(DASHBOARD_FEATURE)).toThrowErrorMatchingInlineSnapshot(
        `"Feature with id [dashboard] has already been registered. Use a unique id."`
      );
    });

    test('throws when registering a solution with a duplicate id', () => {
      const setup = new FeatureCatalogueRegistry().setup();
      setup.registerSolution(OPENSEARCH_DASHBOARDS_SOLUTION);
      expect(() =>
        setup.registerSolution(OPENSEARCH_DASHBOARDS_SOLUTION)
      ).toThrowErrorMatchingInlineSnapshot(
        `"Solution with id [opensearchDashboards] has already been registered. Use a unique id."`
      );
    });
  });

  describe('start', () => {
    describe('capabilities filtering', () => {
      test('retains items with no entry in capabilities', () => {
        const service = new FeatureCatalogueRegistry();
        service.setup().register(DASHBOARD_FEATURE);
        const capabilities = { catalogue: {} } as any;
        service.start({ capabilities });
        expect(service.get()).toEqual([DASHBOARD_FEATURE]);
      });

      test('retains items with true in capabilities', () => {
        const service = new FeatureCatalogueRegistry();
        service.setup().register(DASHBOARD_FEATURE);
        const capabilities = { catalogue: { dashboard: true } } as any;
        service.start({ capabilities });
        expect(service.get()).toEqual([DASHBOARD_FEATURE]);
      });

      test('removes items with false in capabilities', () => {
        const service = new FeatureCatalogueRegistry();
        service.setup().register(DASHBOARD_FEATURE);
        const capabilities = { catalogue: { dashboard: false } } as any;
        service.start({ capabilities });
        expect(service.get()).toEqual([]);
      });
    });

    describe('visibility filtering', () => {
      test('retains items with no "visible" callback', () => {
        const service = new FeatureCatalogueRegistry();
        service.setup().register(DASHBOARD_FEATURE);
        const capabilities = { catalogue: {} } as any;
        service.start({ capabilities });
        expect(service.get()).toEqual([DASHBOARD_FEATURE]);
      });

      test('retains items with a "visible" callback which returns "true"', () => {
        const service = new FeatureCatalogueRegistry();
        const feature = {
          ...DASHBOARD_FEATURE,
          visible: () => true,
        };
        service.setup().register(feature);
        const capabilities = { catalogue: {} } as any;
        service.start({ capabilities });
        expect(service.get()).toEqual([feature]);
      });

      test('removes items with a "visible" callback which returns "false"', () => {
        const service = new FeatureCatalogueRegistry();
        const feature = {
          ...DASHBOARD_FEATURE,
          visible: () => false,
        };
        service.setup().register(feature);
        const capabilities = { catalogue: {} } as any;
        service.start({ capabilities });
        expect(service.get()).toEqual([]);
      });
    });
  });

  describe('title sorting', () => {
    test('sorts by title ascending', () => {
      const service = new FeatureCatalogueRegistry();
      const setup = service.setup();
      setup.register({ id: '1', title: 'Orange' } as any);
      setup.register({ id: '2', title: 'Apple' } as any);
      setup.register({ id: '3', title: 'Banana' } as any);
      const capabilities = { catalogue: {} } as any;
      service.start({ capabilities });
      expect(service.get()).toEqual([
        { id: '2', title: 'Apple' },
        { id: '3', title: 'Banana' },
        { id: '1', title: 'Orange' },
      ]);
    });
  });
});
