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

import _ from 'lodash';

import { Data } from './data';
import { getMockUiState } from '../../fixtures/mocks';

const seriesData = {
  label: '',
  series: [
    {
      label: '100',
      values: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
    },
  ],
};

const rowsData = {
  rows: [
    {
      label: 'a',
      series: [
        {
          label: '100',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    {
      label: 'b',
      series: [
        {
          label: '300',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    {
      label: 'c',
      series: [
        {
          label: '100',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    {
      label: 'd',
      series: [
        {
          label: '200',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
  ],
};

const colsData = {
  columns: [
    {
      label: 'a',
      series: [
        {
          label: '100',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    {
      label: 'b',
      series: [
        {
          label: '300',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    {
      label: 'c',
      series: [
        {
          label: '100',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
    {
      label: 'd',
      series: [
        {
          label: '200',
          values: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
          ],
        },
      ],
    },
  ],
};

describe('Vislib Data Class Test Suite', function () {
  let mockUiState;

  beforeEach(() => {
    mockUiState = getMockUiState();
  });

  describe('Data Class (main)', function () {
    it('should be a function', function () {
      expect(_.isFunction(Data)).toBe(true);
    });

    it('should return an object', function () {
      const rowIn = new Data(rowsData, mockUiState, () => undefined);
      expect(_.isObject(rowIn)).toBe(true);
    });
  });

  describe('_removeZeroSlices', function () {
    let data;
    const pieData = {
      slices: {
        children: [{ size: 30 }, { size: 20 }, { size: 0 }],
      },
    };

    beforeEach(function () {
      data = new Data(pieData, mockUiState, () => undefined);
    });

    it('should remove zero values', function () {
      const slices = data._removeZeroSlices(data.data.slices);
      expect(slices.children.length).toBe(2);
    });
  });

  describe('Data.flatten', function () {
    let serIn;
    let serOut;

    beforeEach(function () {
      serIn = new Data(seriesData, mockUiState, () => undefined);
      serOut = serIn.flatten();
    });

    it('should return an array of value objects from every series', function () {
      expect(serOut.every(_.isObject)).toBe(true);
    });

    it('should return all points from every series', testLength(seriesData));
    it('should return all points from every series in the rows', testLength(rowsData));
    it('should return all points from every series in the columns', testLength(colsData));

    function testLength(inputData) {
      return function () {
        const data = new Data(inputData, mockUiState, () => undefined);
        const len = _.reduce(
          data.chartData(),
          function (sum, chart) {
            return (
              sum +
              chart.series.reduce(function (sum, series) {
                return sum + series.values.length;
              }, 0)
            );
          },
          0
        );

        expect(data.flatten()).toHaveLength(len);
      };
    }
  });

  describe('geohashGrid methods', function () {
    let data;
    const geohashGridData = {
      hits: 3954,
      rows: [
        {
          title: 'Top 5 _type: apache',
          label: 'Top 5 _type: apache',
          geoJson: {
            type: 'FeatureCollection',
            features: [],
            properties: {
              min: 2,
              max: 331,
              zoom: 3,
              center: [47.517200697839414, -112.06054687499999],
            },
          },
        },
        {
          title: 'Top 5 _type: nginx',
          label: 'Top 5 _type: nginx',
          geoJson: {
            type: 'FeatureCollection',
            features: [],
            properties: {
              min: 1,
              max: 88,
              zoom: 3,
              center: [47.517200697839414, -112.06054687499999],
            },
          },
        },
      ],
    };

    beforeEach(function () {
      data = new Data(geohashGridData, mockUiState, () => undefined);
    });

    describe('getVisData', function () {
      it('should return the rows property', function () {
        const visData = data.getVisData();
        expect(visData[0].title).toEqual(geohashGridData.rows[0].title);
      });
    });

    describe('getGeoExtents', function () {
      it('should return the min and max geoJson properties', function () {
        const minMax = data.getGeoExtents();
        expect(minMax.min).toBe(1);
        expect(minMax.max).toBe(331);
      });
    });
  });

  describe('null value check', function () {
    it('should return false', function () {
      const data = new Data(rowsData, mockUiState, () => undefined);
      expect(data.hasNullValues()).toBe(false);
    });

    it('should return true', function () {
      const nullRowData = { rows: rowsData.rows.slice(0) };
      nullRowData.rows.push({
        label: 'e',
        series: [
          {
            label: '200',
            values: [
              { x: 0, y: 1 },
              { x: 1, y: null },
              { x: 2, y: 3 },
            ],
          },
        ],
      });

      const data = new Data(nullRowData, mockUiState, () => undefined);
      expect(data.hasNullValues()).toBe(true);
    });
  });
});
