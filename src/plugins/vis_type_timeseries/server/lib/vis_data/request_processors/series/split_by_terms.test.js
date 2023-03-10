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

import { splitByTerms } from './split_by_terms';

describe('splitByTerms(req, panel, series)', () => {
  let panel;
  let series;
  let req;
  beforeEach(() => {
    panel = {
      time_field: 'timestamp',
    };
    series = {
      id: 'test',
      split_mode: 'terms',
      terms_size: 10,
      terms_field: 'host',
      metrics: [{ id: 'avgmetric', type: 'avg', field: 'cpu' }],
    };
    req = {
      payload: {
        timerange: {
          min: '2017-01-01T00:00:00Z',
          max: '2017-01-01T01:00:00Z',
        },
      },
    };
  });

  test('calls next when finished', () => {
    const next = jest.fn();
    splitByTerms(req, panel, series)(next)({});
    expect(next.mock.calls.length).toEqual(1);
  });

  test('returns a valid terms agg', () => {
    const next = (doc) => doc;
    const doc = splitByTerms(req, panel, series)(next)({});
    expect(doc).toEqual({
      aggs: {
        test: {
          terms: {
            field: 'host',
            order: {
              _count: 'desc',
            },
            size: 10,
          },
        },
      },
    });
  });

  test('returns a valid terms agg sort by terms', () => {
    const next = (doc) => doc;
    series.terms_order_by = '_key';
    series.terms_direction = 'asc';
    const doc = splitByTerms(req, panel, series)(next)({});
    expect(doc).toEqual({
      aggs: {
        test: {
          terms: {
            field: 'host',
            order: {
              _key: 'asc',
            },
            size: 10,
          },
        },
      },
    });
  });

  test('returns a valid terms agg with custom sort', () => {
    series.terms_order_by = 'avgmetric';
    const next = (doc) => doc;
    const doc = splitByTerms(req, panel, series)(next)({});
    expect(doc).toEqual({
      aggs: {
        test: {
          terms: {
            field: 'host',
            size: 10,
            order: {
              'avgmetric-SORT': 'desc',
            },
          },
          aggs: {
            'avgmetric-SORT': {
              avg: {
                field: 'cpu',
              },
            },
          },
        },
      },
    });
  });

  test('calls next and does not add a terms agg', () => {
    series.split_mode = 'everything';
    const next = jest.fn((doc) => doc);
    const doc = splitByTerms(req, panel, series)(next)({});
    expect(next.mock.calls.length).toEqual(1);
    expect(doc).toEqual({});
  });
});
