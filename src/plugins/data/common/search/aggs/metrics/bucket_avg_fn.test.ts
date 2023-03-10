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
import { aggBucketAvg } from './bucket_avg_fn';

describe('agg_expression_functions', () => {
  describe('aggBucketAvg', () => {
    const fn = functionWrapper(aggBucketAvg());

    test('handles customMetric and customBucket as a subexpression', () => {
      const actual = fn({
        customMetric: fn({}),
        customBucket: fn({}),
      });

      expect(actual.value.params).toMatchInlineSnapshot(`
        Object {
          "customBucket": Object {
            "enabled": true,
            "id": undefined,
            "params": Object {
              "customBucket": undefined,
              "customLabel": undefined,
              "customMetric": undefined,
              "json": undefined,
            },
            "schema": undefined,
            "type": "avg_bucket",
          },
          "customLabel": undefined,
          "customMetric": Object {
            "enabled": true,
            "id": undefined,
            "params": Object {
              "customBucket": undefined,
              "customLabel": undefined,
              "customMetric": undefined,
              "json": undefined,
            },
            "schema": undefined,
            "type": "avg_bucket",
          },
          "json": undefined,
        }
      `);
    });

    test('correctly parses json string argument', () => {
      const actual = fn({
        json: '{ "foo": true }',
      });

      expect(actual.value.params.json).toEqual({ foo: true });
      expect(() => {
        fn({
          json: '/// intentionally malformed json ///',
        });
      }).toThrowErrorMatchingInlineSnapshot(`"Unable to parse json argument string"`);
    });
  });
});
