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

import { seriesAgg } from './series_agg';
import { stdMetric } from './std_metric';

describe('seriesAgg(resp, panel, series)', () => {
  let panel;
  let series;
  let resp;
  beforeEach(() => {
    panel = {
      time_field: 'timestamp',
    };
    series = {
      chart_type: 'line',
      stacked: false,
      line_width: 1,
      point_size: 1,
      fill: 0,
      color: '#F00',
      id: 'test',
      label: 'Total CPU',
      split_mode: 'terms',
      metrics: [
        {
          id: 'avgcpu',
          type: 'avg',
          field: 'cpu',
        },
        {
          id: 'seriesgg',
          type: 'series_agg',
          function: 'sum',
        },
      ],
    };
    resp = {
      aggregations: {
        test: {
          buckets: [
            {
              key: 'example-01',
              timeseries: {
                buckets: [
                  {
                    key: 1,
                    avgcpu: { value: 0.25 },
                  },
                  {
                    key: 2,
                    avgcpu: { value: 0.25 },
                  },
                ],
              },
            },
            {
              key: 'example-02',
              timeseries: {
                buckets: [
                  {
                    key: 1,
                    avgcpu: { value: 0.25 },
                  },
                  {
                    key: 2,
                    avgcpu: { value: 0.25 },
                  },
                ],
              },
            },
          ],
        },
      },
    };
  });

  test('calls next when finished', () => {
    const next = jest.fn();
    seriesAgg(resp, panel, series)(next)([]);
    expect(next.mock.calls.length).toEqual(1);
  });

  test('creates a series', () => {
    const next = seriesAgg(resp, panel, series)((results) => results);
    const results = stdMetric(resp, panel, series)(next)([]);
    expect(results).toHaveLength(1);

    expect(results[0]).toEqual({
      id: 'test',
      color: '#F00',
      label: 'Total CPU',
      stack: false,
      seriesId: 'test',
      lines: { show: true, fill: 0, lineWidth: 1, steps: false },
      points: { show: true, radius: 1, lineWidth: 1 },
      bars: { fill: 0, lineWidth: 1, show: false },
      data: [
        [1, 0.5],
        [2, 0.5],
      ],
    });
  });
});
