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

import { buildHierarchicalData, Dimensions, Dimension } from './build_hierarchical_data';
import { Table, TableParent } from '../../types';

function tableVisResponseHandler(table: Table, dimensions: Dimensions) {
  const converted: {
    tables: Array<TableParent | Table>;
  } = {
    tables: [],
  };

  const split = dimensions.splitColumn || dimensions.splitRow;

  if (split) {
    const splitColumnIndex = split[0].accessor;
    const splitColumn = table.columns[splitColumnIndex];
    const splitMap: { [key: string]: number } = {};
    let splitIndex = 0;

    table.rows.forEach((row, rowIndex) => {
      const splitValue = row[splitColumn.id] as string;

      if (!splitMap.hasOwnProperty(splitValue)) {
        splitMap[splitValue] = splitIndex++;
        const tableGroup = {
          $parent: converted,
          title: `splitValue: ${splitColumn.name}`,
          name: splitColumn.name,
          key: splitValue,
          column: splitColumnIndex,
          row: rowIndex,
          table,
          tables: [] as Table[],
        } as any;

        tableGroup.tables.push({
          $parent: tableGroup,
          columns: table.columns,
          rows: [],
        });

        converted.tables.push(tableGroup);
      }

      const tableIndex = splitMap[splitValue];
      (converted.tables[tableIndex] as TableParent).tables![0].rows.push(row);
    });
  } else {
    converted.tables.push({
      columns: table.columns,
      rows: table.rows,
    } as Table);
  }

  return converted;
}

jest.mock('../../../services', () => ({
  getFormatService: jest.fn(() => ({
    deserialize: () => ({
      convert: jest.fn((v) => JSON.stringify(v)),
    }),
  })),
}));

describe('buildHierarchicalData convertTable', () => {
  describe('metric only', () => {
    let dimensions: Dimensions;
    let table: Table;

    beforeEach(() => {
      const tabifyResponse = {
        columns: [{ id: 'col-0-agg_1', name: 'Average bytes' }],
        rows: [{ 'col-0-agg_1': 412032 }],
      };
      dimensions = {
        metric: { accessor: 0 } as Dimension,
      };

      const tableGroup = tableVisResponseHandler(tabifyResponse, dimensions);
      table = tableGroup.tables[0] as Table;
    });

    it('should set the slices with one child to a consistent label', () => {
      const results = buildHierarchicalData(table, dimensions);
      const checkLabel = 'Average bytes';
      expect(results).toHaveProperty('names');
      expect(results.names).toEqual([checkLabel]);
      expect(results).toHaveProperty('raw');
      expect(results.raw).toHaveProperty('rows');
      expect(results.raw.rows).toHaveLength(1);
      expect(results).toHaveProperty('slices');
      expect(results.slices).toHaveProperty('children');
      expect(results.slices.children).toHaveLength(1);
      expect(results.slices.children[0]).toHaveProperty('name', checkLabel);
      expect(results.slices.children[0]).toHaveProperty('size', 412032);
    });
  });

  describe('threeTermBuckets', () => {
    let dimensions: Dimensions;
    let tables: TableParent[];

    beforeEach(async () => {
      const tabifyResponse = {
        columns: [
          { id: 'col-0-agg_2', name: 'extension: Descending' },
          { id: 'col-1-agg_1', name: 'Average bytes' },
          { id: 'col-2-agg_3', name: 'geo.src: Descending' },
          { id: 'col-3-agg_1', name: 'Average bytes' },
          { id: 'col-4-agg_4', name: 'machine.os: Descending' },
          { id: 'col-5-agg_1', name: 'Average bytes' },
        ],
        rows: [
          {
            'col-0-agg_2': 'png',
            'col-2-agg_3': 'IT',
            'col-4-agg_4': 'win',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 9299,
            'col-5-agg_1': 0,
          },
          {
            'col-0-agg_2': 'png',
            'col-2-agg_3': 'IT',
            'col-4-agg_4': 'mac',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 9299,
            'col-5-agg_1': 9299,
          },
          {
            'col-0-agg_2': 'png',
            'col-2-agg_3': 'US',
            'col-4-agg_4': 'linux',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 8293,
            'col-5-agg_1': 3992,
          },
          {
            'col-0-agg_2': 'png',
            'col-2-agg_3': 'US',
            'col-4-agg_4': 'mac',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 8293,
            'col-5-agg_1': 3029,
          },
          {
            'col-0-agg_2': 'css',
            'col-2-agg_3': 'MX',
            'col-4-agg_4': 'win',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 9299,
            'col-5-agg_1': 4992,
          },
          {
            'col-0-agg_2': 'css',
            'col-2-agg_3': 'MX',
            'col-4-agg_4': 'mac',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 9299,
            'col-5-agg_1': 5892,
          },
          {
            'col-0-agg_2': 'css',
            'col-2-agg_3': 'US',
            'col-4-agg_4': 'linux',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 8293,
            'col-5-agg_1': 3992,
          },
          {
            'col-0-agg_2': 'css',
            'col-2-agg_3': 'US',
            'col-4-agg_4': 'mac',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 8293,
            'col-5-agg_1': 3029,
          },
          {
            'col-0-agg_2': 'html',
            'col-2-agg_3': 'CN',
            'col-4-agg_4': 'win',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 9299,
            'col-5-agg_1': 4992,
          },
          {
            'col-0-agg_2': 'html',
            'col-2-agg_3': 'CN',
            'col-4-agg_4': 'mac',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 9299,
            'col-5-agg_1': 5892,
          },
          {
            'col-0-agg_2': 'html',
            'col-2-agg_3': 'FR',
            'col-4-agg_4': 'win',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 8293,
            'col-5-agg_1': 3992,
          },
          {
            'col-0-agg_2': 'html',
            'col-2-agg_3': 'FR',
            'col-4-agg_4': 'mac',
            'col-1-agg_1': 412032,
            'col-3-agg_1': 8293,
            'col-5-agg_1': 3029,
          },
        ],
      };
      dimensions = {
        splitRow: [{ accessor: 0 } as Dimension],
        metric: { accessor: 5 } as Dimension,
        buckets: [{ accessor: 2 }, { accessor: 4 }] as Dimension[],
      };
      const tableGroup = await tableVisResponseHandler(tabifyResponse, dimensions);
      tables = tableGroup.tables as TableParent[];
    });

    it('should set the correct hits attribute for each of the results', () => {
      tables.forEach((t) => {
        const results = buildHierarchicalData(t.tables![0], dimensions);
        expect(results).toHaveProperty('hits');
        expect(results.hits).toBe(4);
      });
    });

    it('should set the correct names for each of the results', () => {
      const results0 = buildHierarchicalData(tables[0].tables![0], dimensions);
      expect(results0).toHaveProperty('names');
      expect(results0.names).toHaveLength(5);

      const results1 = buildHierarchicalData(tables[1].tables![0], dimensions);
      expect(results1).toHaveProperty('names');
      expect(results1.names).toHaveLength(5);

      const results2 = buildHierarchicalData(tables[2].tables![0], dimensions);
      expect(results2).toHaveProperty('names');
      expect(results2.names).toHaveLength(4);
    });

    it('should set the parent of the first item in the split', () => {
      const results0 = buildHierarchicalData(tables[0].tables![0], dimensions);
      expect(results0).toHaveProperty('slices');
      expect(results0.slices).toHaveProperty('children');
      expect(results0.slices.children).toHaveLength(2);
      expect(results0.slices.children[0].rawData!.table.$parent).toHaveProperty('key', 'png');

      const results1 = buildHierarchicalData(tables[1].tables![0], dimensions);
      expect(results1).toHaveProperty('slices');
      expect(results1.slices).toHaveProperty('children');
      expect(results1.slices.children).toHaveLength(2);
      expect(results1.slices.children[0].rawData!.table.$parent).toHaveProperty('key', 'css');

      const results2 = buildHierarchicalData(tables[2].tables![0], dimensions);
      expect(results2).toHaveProperty('slices');
      expect(results2.slices).toHaveProperty('children');
      expect(results2.slices.children).toHaveLength(2);
      expect(results2.slices.children[0].rawData!.table.$parent).toHaveProperty('key', 'html');
    });
  });

  describe('oneHistogramBucket', () => {
    let dimensions: Dimensions;
    let table: Table;

    beforeEach(async () => {
      const tabifyResponse = {
        columns: [
          { id: 'col-0-agg_2', name: 'bytes' },
          { id: 'col-1-1', name: 'Count' },
        ],
        rows: [
          { 'col-0-agg_2': 1411862400000, 'col-1-1': 8247 },
          { 'col-0-agg_2': 1411948800000, 'col-1-1': 8184 },
          { 'col-0-agg_2': 1412035200000, 'col-1-1': 8269 },
          { 'col-0-agg_2': 1412121600000, 'col-1-1': 8141 },
          { 'col-0-agg_2': 1412208000000, 'col-1-1': 8148 },
          { 'col-0-agg_2': 1412294400000, 'col-1-1': 8219 },
        ],
      };
      dimensions = {
        metric: { accessor: 1 } as Dimension,
        buckets: [{ accessor: 0 } as Dimension],
      };
      const tableGroup = await tableVisResponseHandler(tabifyResponse, dimensions);
      table = tableGroup.tables[0] as Table;
    });

    it('should set the hits attribute for the results', () => {
      const results = buildHierarchicalData(table, dimensions);
      expect(results).toHaveProperty('raw');
      expect(results).toHaveProperty('slices');
      expect(results.slices).toHaveProperty('children');
      expect(results).toHaveProperty('names');
      expect(results.names).toHaveLength(6);
    });
  });

  describe('oneRangeBucket', () => {
    let dimensions: Dimensions;
    let table: Table;

    beforeEach(async () => {
      const tabifyResponse = {
        columns: [
          { id: 'col-0-agg_2', name: 'bytes ranges' },
          { id: 'col-1-1', name: 'Count' },
        ],
        rows: [
          { 'col-0-agg_2': { gte: 0, lt: 1000 }, 'col-1-1': 606 },
          { 'col-0-agg_2': { gte: 1000, lt: 2000 }, 'col-1-1': 298 },
        ],
      };
      dimensions = {
        metric: { accessor: 1 } as Dimension,
        buckets: [{ accessor: 0, format: { id: 'range', params: { id: 'agg_2' } } } as Dimension],
      };
      const tableGroup = await tableVisResponseHandler(tabifyResponse, dimensions);
      table = tableGroup.tables[0] as Table;
    });

    it('should set the hits attribute for the results', () => {
      const results = buildHierarchicalData(table, dimensions);
      expect(results).toHaveProperty('raw');
      expect(results).toHaveProperty('slices');
      expect(results.slices).toHaveProperty('children');
      expect(results).toHaveProperty('names');
      expect(results.names).toHaveLength(2);
    });
  });

  describe('oneFilterBucket', () => {
    let dimensions: Dimensions;
    let table: Table;

    beforeEach(async () => {
      const tabifyResponse = {
        columns: [
          { id: 'col-0-agg_2', name: 'filters' },
          { id: 'col-1-1', name: 'Count' },
        ],
        rows: [
          { 'col-0-agg_2': 'type:apache', 'col-1-1': 4844 },
          { 'col-0-agg_2': 'type:nginx', 'col-1-1': 1161 },
        ],
      };
      dimensions = {
        metric: { accessor: 1 } as Dimension,
        buckets: [
          {
            accessor: 0,
          },
        ] as Dimension[],
      };
      const tableGroup = await tableVisResponseHandler(tabifyResponse, dimensions);
      table = tableGroup.tables[0] as Table;
    });

    it('should set the hits attribute for the results', () => {
      const results = buildHierarchicalData(table, dimensions);
      expect(results).toHaveProperty('raw');
      expect(results).toHaveProperty('slices');
      expect(results).toHaveProperty('names');
      expect(results.names).toHaveLength(2);
    });
  });
});
