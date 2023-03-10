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
  AggsCommonService,
  AggsCommonSetupDependencies,
  AggsCommonStartDependencies,
} from './aggs_service';
import { AggTypesDependencies, getAggTypes } from './agg_types';
import { BucketAggType } from './buckets/bucket_agg_type';
import { MetricAggType } from './metrics/metric_agg_type';

describe('Aggs service', () => {
  let service: AggsCommonService;
  let setupDeps: AggsCommonSetupDependencies;
  let startDeps: AggsCommonStartDependencies;
  const aggTypesDependencies: AggTypesDependencies = {
    calculateBounds: jest.fn(),
    getFieldFormatsStart: jest.fn(),
    getConfig: jest.fn(),
    isDefaultTimezone: () => true,
  };

  beforeEach(() => {
    service = new AggsCommonService();
    setupDeps = {
      registerFunction: jest.fn(),
    };
    startDeps = {
      getConfig: jest.fn(),
      uiSettings: { get: jest.fn().mockImplementation(() => []) } as any,
    };
  });

  describe('setup()', () => {
    test('exposes proper contract', () => {
      const setup = service.setup(setupDeps);
      expect(Object.keys(setup).length).toBe(1);
      expect(setup).toHaveProperty('types');
    });

    test('instantiates a new registry', () => {
      const a = new AggsCommonService();
      const b = new AggsCommonService();
      const bSetupDeps = {
        registerFunction: jest.fn(),
      };

      const aSetup = a.setup(setupDeps);
      aSetup.types.registerBucket(
        'foo',
        () => ({ name: 'foo', type: 'buckets' } as BucketAggType<any>)
      );
      const aStart = a.start(startDeps);
      expect(aStart.types.getAll().buckets.map((t) => t(aggTypesDependencies).name))
        .toMatchInlineSnapshot(`
        Array [
          "date_histogram",
          "histogram",
          "range",
          "date_range",
          "ip_range",
          "terms",
          "filter",
          "filters",
          "significant_terms",
          "geohash_grid",
          "geotile_grid",
          "foo",
        ]
      `);
      expect(aStart.types.getAll().metrics.map((t) => t(aggTypesDependencies).name))
        .toMatchInlineSnapshot(`
        Array [
          "count",
          "avg",
          "sum",
          "median",
          "min",
          "max",
          "std_dev",
          "cardinality",
          "percentiles",
          "percentile_ranks",
          "top_hits",
          "derivative",
          "cumulative_sum",
          "moving_avg",
          "serial_diff",
          "avg_bucket",
          "sum_bucket",
          "min_bucket",
          "max_bucket",
          "geo_bounds",
          "geo_centroid",
        ]
      `);

      b.setup(bSetupDeps);
      const bStart = b.start(startDeps);
      expect(bStart.types.getAll().buckets.map((t) => t(aggTypesDependencies).name))
        .toMatchInlineSnapshot(`
        Array [
          "date_histogram",
          "histogram",
          "range",
          "date_range",
          "ip_range",
          "terms",
          "filter",
          "filters",
          "significant_terms",
          "geohash_grid",
          "geotile_grid",
        ]
      `);
      expect(bStart.types.getAll().metrics.map((t) => t(aggTypesDependencies).name))
        .toMatchInlineSnapshot(`
        Array [
          "count",
          "avg",
          "sum",
          "median",
          "min",
          "max",
          "std_dev",
          "cardinality",
          "percentiles",
          "percentile_ranks",
          "top_hits",
          "derivative",
          "cumulative_sum",
          "moving_avg",
          "serial_diff",
          "avg_bucket",
          "sum_bucket",
          "min_bucket",
          "max_bucket",
          "geo_bounds",
          "geo_centroid",
        ]
      `);
    });

    test('registers default agg types', () => {
      service.setup(setupDeps);
      const start = service.start(startDeps);

      const aggTypes = getAggTypes();
      expect(start.types.getAll().buckets.length).toBe(aggTypes.buckets.length);
      expect(start.types.getAll().metrics.length).toBe(aggTypes.metrics.length);
    });

    test('merges default agg types with types registered during setup', () => {
      const setup = service.setup(setupDeps);
      setup.types.registerBucket(
        'foo',
        () => ({ name: 'foo', type: 'buckets' } as BucketAggType<any>)
      );
      setup.types.registerMetric(
        'bar',
        () => ({ name: 'bar', type: 'metrics' } as MetricAggType<any>)
      );
      const start = service.start(startDeps);

      const aggTypes = getAggTypes();
      expect(start.types.getAll().buckets.length).toBe(aggTypes.buckets.length + 1);
      expect(start.types.getAll().buckets.some((t) => t(aggTypesDependencies).name === 'foo')).toBe(
        true
      );
      expect(start.types.getAll().metrics.length).toBe(aggTypes.metrics.length + 1);
      expect(start.types.getAll().metrics.some((t) => t(aggTypesDependencies).name === 'bar')).toBe(
        true
      );
    });

    test('registers all agg type expression functions', () => {
      service.setup(setupDeps);
      const aggTypes = getAggTypes();
      expect(setupDeps.registerFunction).toHaveBeenCalledTimes(
        aggTypes.buckets.length + aggTypes.metrics.length
      );
    });
  });

  describe('start()', () => {
    test('exposes proper contract', () => {
      const start = service.start(startDeps);
      expect(Object.keys(start).length).toBe(3);
      expect(start).toHaveProperty('calculateAutoTimeExpression');
      expect(start).toHaveProperty('createAggConfigs');
      expect(start).toHaveProperty('types');
    });

    test('types registry returns uninitialized type providers', () => {
      service.setup(setupDeps);
      const start = service.start(startDeps);
      expect(typeof start.types.get('terms')).toBe('function');
      expect(start.types.get('terms')(aggTypesDependencies).name).toBe('terms');
    });
  });
});
