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

import { rangeControlFactory } from './range_control_factory';
import { ControlParams, CONTROL_TYPES } from '../editor_utils';
import { getDepsMock, getSearchSourceMock } from '../test_utils';

describe('rangeControlFactory', () => {
  describe('fetch', () => {
    const controlParams: ControlParams = {
      id: '1',
      fieldName: 'myNumberField',
      options: {},
      type: CONTROL_TYPES.RANGE,
      label: 'test',
      indexPattern: {} as any,
      parent: {} as any,
    };
    const useTimeFilter = false;

    test('should set min and max from aggregation results', async () => {
      const opensearchSearchResponse = {
        aggregations: {
          maxAgg: { value: 100 },
          minAgg: { value: 10 },
        },
      };
      const searchSourceMock = getSearchSourceMock(opensearchSearchResponse);
      const deps = getDepsMock({
        searchSource: {
          create: searchSourceMock,
        },
      });

      const rangeControl = await rangeControlFactory(controlParams, useTimeFilter, deps);
      await rangeControl.fetch();

      expect(rangeControl.isEnabled()).toBe(true);
      expect(rangeControl.min).toBe(10);
      expect(rangeControl.max).toBe(100);
    });

    test('should disable control when there are 0 hits', async () => {
      // OPENSEARCH response when the query does not match any documents
      const opensearchSearchResponse = {
        aggregations: {
          maxAgg: { value: null },
          minAgg: { value: null },
        },
      };
      const searchSourceMock = getSearchSourceMock(opensearchSearchResponse);
      const deps = getDepsMock({
        searchSource: {
          create: searchSourceMock,
        },
      });

      const rangeControl = await rangeControlFactory(controlParams, useTimeFilter, deps);
      await rangeControl.fetch();

      expect(rangeControl.isEnabled()).toBe(false);
    });

    test('should disable control when response is empty', async () => {
      // OPENSEARCH response for dashboardonly user who does not have read permissions on index is 200 (which is weird)
      // and there is not aggregations key
      const opensearchSearchResponse = {};
      const searchSourceMock = getSearchSourceMock(opensearchSearchResponse);
      const deps = getDepsMock({
        searchSource: {
          create: searchSourceMock,
        },
      });

      const rangeControl = await rangeControlFactory(controlParams, useTimeFilter, deps);
      await rangeControl.fetch();

      expect(rangeControl.isEnabled()).toBe(false);
    });
  });
});
