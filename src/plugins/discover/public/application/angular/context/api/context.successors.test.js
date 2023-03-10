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

import moment from 'moment';
import { get, last } from 'lodash';

import { createIndexPatternsStub, createContextSearchSourceStub } from './_stubs';
import { setServices } from '../../../../opensearch_dashboards_services';

import { fetchContextProvider } from './context';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ANCHOR_TIMESTAMP = new Date(MS_PER_DAY).toJSON();
const ANCHOR_TIMESTAMP_3 = new Date(MS_PER_DAY * 3).toJSON();
const ANCHOR_TIMESTAMP_3000 = new Date(MS_PER_DAY * 3000).toJSON();

describe('context app', function () {
  describe('function fetchSuccessors', function () {
    let fetchSuccessors;
    let mockSearchSource;

    beforeEach(() => {
      mockSearchSource = createContextSearchSourceStub([], '@timestamp');

      setServices({
        data: {
          search: {
            searchSource: {
              create: jest.fn().mockImplementation(() => mockSearchSource),
            },
          },
        },
      });

      fetchSuccessors = (
        indexPatternId,
        timeField,
        sortDir,
        timeValIso,
        timeValNr,
        tieBreakerField,
        tieBreakerValue,
        size
      ) => {
        const anchor = {
          _source: {
            [timeField]: timeValIso,
          },
          sort: [timeValNr, tieBreakerValue],
        };

        return fetchContextProvider(createIndexPatternsStub()).fetchSurroundingDocs(
          'successors',
          indexPatternId,
          anchor,
          timeField,
          tieBreakerField,
          sortDir,
          size,
          []
        );
      };
    });

    it('should perform exactly one query when enough hits are returned', function () {
      mockSearchSource._stubHits = [
        mockSearchSource._createStubHit(MS_PER_DAY * 5000),
        mockSearchSource._createStubHit(MS_PER_DAY * 4000),
        mockSearchSource._createStubHit(MS_PER_DAY * 3000),
        mockSearchSource._createStubHit(MS_PER_DAY * 3000 - 1),
        mockSearchSource._createStubHit(MS_PER_DAY * 3000 - 2),
      ];

      return fetchSuccessors(
        'INDEX_PATTERN_ID',
        '@timestamp',
        'desc',
        ANCHOR_TIMESTAMP_3000,
        MS_PER_DAY * 3000,
        '_doc',
        0,
        3,
        []
      ).then((hits) => {
        expect(mockSearchSource.fetch.calledOnce).toBe(true);
        expect(hits).toEqual(mockSearchSource._stubHits.slice(-3));
      });
    });

    it('should perform multiple queries with the last being unrestricted when too few hits are returned', function () {
      mockSearchSource._stubHits = [
        mockSearchSource._createStubHit(MS_PER_DAY * 3010),
        mockSearchSource._createStubHit(MS_PER_DAY * 3002),
        mockSearchSource._createStubHit(MS_PER_DAY * 3000),
        mockSearchSource._createStubHit(MS_PER_DAY * 2998),
        mockSearchSource._createStubHit(MS_PER_DAY * 2990),
      ];

      return fetchSuccessors(
        'INDEX_PATTERN_ID',
        '@timestamp',
        'desc',
        ANCHOR_TIMESTAMP_3000,
        MS_PER_DAY * 3000,
        '_doc',
        0,
        6,
        []
      ).then((hits) => {
        const intervals = mockSearchSource.setField.args
          .filter(([property]) => property === 'query')
          .map(([, { query }]) =>
            get(query, ['bool', 'must', 'constant_score', 'filter', 'range', '@timestamp'])
          );

        expect(
          intervals.every(({ gte, lte }) => (gte && lte ? moment(gte).isBefore(lte) : true))
        ).toBe(true);
        // should have started at the given time
        expect(intervals[0].lte).toEqual(moment(MS_PER_DAY * 3000).toISOString());
        // should have ended with a half-open interval
        expect(Object.keys(last(intervals))).toEqual(['format', 'lte']);
        expect(intervals.length).toBeGreaterThan(1);

        expect(hits).toEqual(mockSearchSource._stubHits.slice(-3));
      });
    });

    it('should perform multiple queries until the expected hit count is returned', function () {
      mockSearchSource._stubHits = [
        mockSearchSource._createStubHit(MS_PER_DAY * 3000),
        mockSearchSource._createStubHit(MS_PER_DAY * 3000 - 1),
        mockSearchSource._createStubHit(MS_PER_DAY * 3000 - 2),
        mockSearchSource._createStubHit(MS_PER_DAY * 2800),
        mockSearchSource._createStubHit(MS_PER_DAY * 2200),
        mockSearchSource._createStubHit(MS_PER_DAY * 1000),
      ];

      return fetchSuccessors(
        'INDEX_PATTERN_ID',
        '@timestamp',
        'desc',
        ANCHOR_TIMESTAMP_3000,
        MS_PER_DAY * 3000,
        '_doc',
        0,
        4,
        []
      ).then((hits) => {
        const intervals = mockSearchSource.setField.args
          .filter(([property]) => property === 'query')
          .map(([, { query }]) =>
            get(query, ['bool', 'must', 'constant_score', 'filter', 'range', '@timestamp'])
          );

        // should have started at the given time
        expect(intervals[0].lte).toEqual(moment(MS_PER_DAY * 3000).toISOString());
        // should have stopped before reaching MS_PER_DAY * 2200
        expect(moment(last(intervals).gte).valueOf()).toBeGreaterThan(MS_PER_DAY * 2200);
        expect(intervals.length).toBeGreaterThan(1);

        expect(hits).toEqual(mockSearchSource._stubHits.slice(0, 4));
      });
    });

    it('should return an empty array when no hits were found', function () {
      return fetchSuccessors(
        'INDEX_PATTERN_ID',
        '@timestamp',
        'desc',
        ANCHOR_TIMESTAMP_3,
        MS_PER_DAY * 3,
        '_doc',
        0,
        3,
        []
      ).then((hits) => {
        expect(hits).toEqual([]);
      });
    });

    it('should configure the SearchSource to not inherit from the implicit root', function () {
      return fetchSuccessors(
        'INDEX_PATTERN_ID',
        '@timestamp',
        'desc',
        ANCHOR_TIMESTAMP_3,
        MS_PER_DAY * 3,
        '_doc',
        0,
        3,
        []
      ).then(() => {
        const setParentSpy = mockSearchSource.setParent;
        expect(setParentSpy.alwaysCalledWith(undefined)).toBe(true);
        expect(setParentSpy.called).toBe(true);
      });
    });

    it('should set the tiebreaker sort order to the same as the time field', function () {
      return fetchSuccessors(
        'INDEX_PATTERN_ID',
        '@timestamp',
        'desc',
        ANCHOR_TIMESTAMP,
        MS_PER_DAY,
        '_doc',
        0,
        3,
        []
      ).then(() => {
        expect(
          mockSearchSource.setField.calledWith('sort', [{ '@timestamp': 'desc' }, { _doc: 'desc' }])
        ).toBe(true);
      });
    });
  });
});
