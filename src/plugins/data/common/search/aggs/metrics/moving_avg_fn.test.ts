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

import { functionWrapper } from '../test_helpers';
import { aggMovingAvg } from './moving_avg_fn';

describe('agg_expression_functions', () => {
  describe('aggMovingAvg', () => {
    const fn = functionWrapper(aggMovingAvg());

    test('fills in defaults when only required args are provided', () => {
      const actual = fn({
        buckets_path: 'the_sum',
      });
      expect(actual).toMatchInlineSnapshot(`
        Object {
          "type": "agg_type",
          "value": Object {
            "enabled": true,
            "id": undefined,
            "params": Object {
              "buckets_path": "the_sum",
              "customLabel": undefined,
              "customMetric": undefined,
              "json": undefined,
              "metricAgg": undefined,
              "script": undefined,
              "window": undefined,
            },
            "schema": undefined,
            "type": "moving_avg",
          },
        }
      `);
    });

    test('includes optional params when they are provided', () => {
      const actual = fn({
        buckets_path: 'the_sum',
        metricAgg: 'sum',
        window: 10,
        script: 'test',
      });
      expect(actual).toMatchInlineSnapshot(`
        Object {
          "type": "agg_type",
          "value": Object {
            "enabled": true,
            "id": undefined,
            "params": Object {
              "buckets_path": "the_sum",
              "customLabel": undefined,
              "customMetric": undefined,
              "json": undefined,
              "metricAgg": "sum",
              "script": "test",
              "window": 10,
            },
            "schema": undefined,
            "type": "moving_avg",
          },
        }
      `);
    });

    test('handles customMetric as a subexpression', () => {
      const actual = fn({
        customMetric: fn({ buckets_path: 'the_sum' }),
        buckets_path: 'the_sum',
      });

      expect(actual.value.params).toMatchInlineSnapshot(`
        Object {
          "buckets_path": "the_sum",
          "customLabel": undefined,
          "customMetric": Object {
            "enabled": true,
            "id": undefined,
            "params": Object {
              "buckets_path": "the_sum",
              "customLabel": undefined,
              "customMetric": undefined,
              "json": undefined,
              "metricAgg": undefined,
              "script": undefined,
              "window": undefined,
            },
            "schema": undefined,
            "type": "moving_avg",
          },
          "json": undefined,
          "metricAgg": undefined,
          "script": undefined,
          "window": undefined,
        }
      `);
    });

    test('correctly parses json string argument', () => {
      const actual = fn({
        json: '{ "foo": true }',
        buckets_path: 'the_sum',
      });

      expect(actual.value.params.json).toEqual({ foo: true });
      expect(() => {
        fn({
          json: '/// intentionally malformed json ///',
          buckets_path: 'the_sum',
        });
      }).toThrowErrorMatchingInlineSnapshot(`"Unable to parse json argument string"`);
    });
  });
});
