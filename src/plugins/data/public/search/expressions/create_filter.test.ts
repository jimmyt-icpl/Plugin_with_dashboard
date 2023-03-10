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
  AggConfigs,
  IAggConfig,
  TabbedTable,
  isRangeFilter,
  BytesFormat,
  FieldFormatsGetConfigFn,
} from '../../../common';
import { mockAggTypesRegistry } from '../../../common/search/aggs/test_helpers';

import { createFilter } from './create_filter';

describe('createFilter', () => {
  let table: TabbedTable;
  let aggConfig: IAggConfig;

  const typesRegistry = mockAggTypesRegistry();

  const getAggConfigs = (type: string, params: any) => {
    const field = {
      name: 'bytes',
      filterable: true,
      indexPattern: {
        id: '1234',
      },
      format: new BytesFormat({}, (() => {}) as FieldFormatsGetConfigFn),
    };

    const indexPattern = {
      id: '1234',
      title: 'logstash-*',
      fields: {
        getByName: () => field,
        filter: () => [field],
      },
      getFormatterForField: () => new BytesFormat({}, (() => {}) as FieldFormatsGetConfigFn),
    } as any;

    return new AggConfigs(
      indexPattern,
      [
        {
          id: type,
          type,
          schema: 'buckets',
          params,
        },
      ],
      { typesRegistry }
    );
  };

  const aggConfigParams: Record<string, any> = {
    field: 'bytes',
    interval: 30,
    otherBucket: true,
  };

  beforeEach(() => {
    table = {
      columns: [
        {
          id: '1-1',
          name: 'test',
          aggConfig,
        },
      ],
      rows: [
        {
          '1-1': '2048',
        },
      ],
    };
  });

  test('ignores event when cell value is not provided', async () => {
    aggConfig = getAggConfigs('histogram', aggConfigParams).aggs[0];
    const filters = await createFilter([aggConfig], table, 0, -1, null);

    expect(filters).not.toBeDefined();
  });

  test('handles an event when aggregations type is a terms', async () => {
    aggConfig = getAggConfigs('terms', aggConfigParams).aggs[0];
    const filters = await createFilter([aggConfig], table, 0, 0, 'test');

    expect(filters).toBeDefined();

    if (filters) {
      expect(filters.length).toEqual(1);
      expect(filters[0].query.match_phrase.bytes).toEqual('2048');
    }
  });

  test('handles an event when aggregations type is not terms', async () => {
    aggConfig = getAggConfigs('histogram', aggConfigParams).aggs[0];
    const filters = await createFilter([aggConfig], table, 0, 0, 'test');

    expect(filters).toBeDefined();

    if (filters) {
      expect(filters.length).toEqual(1);

      const [rangeFilter] = filters;

      if (isRangeFilter(rangeFilter)) {
        expect(rangeFilter.range.bytes.gte).toEqual(2048);
        expect(rangeFilter.range.bytes.lt).toEqual(2078);
      }
    }
  });
});
