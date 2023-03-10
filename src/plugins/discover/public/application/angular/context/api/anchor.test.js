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

import { createIndexPatternsStub, createSearchSourceStub } from './_stubs';

import { fetchAnchorProvider } from './anchor';

describe('context app', function () {
  describe('function fetchAnchor', function () {
    let fetchAnchor;
    let searchSourceStub;

    beforeEach(() => {
      searchSourceStub = createSearchSourceStub([{ _id: 'hit1' }]);
      fetchAnchor = fetchAnchorProvider(createIndexPatternsStub(), searchSourceStub);
    });

    it('should use the `fetch` method of the SearchSource', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        expect(searchSourceStub.fetch.calledOnce).toBe(true);
      });
    });

    it('should configure the SearchSource to not inherit from the implicit root', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        const setParentSpy = searchSourceStub.setParent;
        expect(setParentSpy.calledOnce).toBe(true);
        expect(setParentSpy.firstCall.args[0]).toBe(undefined);
      });
    });

    it('should set the SearchSource index pattern', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        const setFieldSpy = searchSourceStub.setField;
        expect(setFieldSpy.firstCall.args[1].id).toEqual('INDEX_PATTERN_ID');
      });
    });

    it('should set the SearchSource version flag to true', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        const setVersionSpy = searchSourceStub.setField.withArgs('version');
        expect(setVersionSpy.calledOnce).toBe(true);
        expect(setVersionSpy.firstCall.args[1]).toEqual(true);
      });
    });

    it('should set the SearchSource size to 1', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        const setSizeSpy = searchSourceStub.setField.withArgs('size');
        expect(setSizeSpy.calledOnce).toBe(true);
        expect(setSizeSpy.firstCall.args[1]).toEqual(1);
      });
    });

    it('should set the SearchSource query to an ids query', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        const setQuerySpy = searchSourceStub.setField.withArgs('query');
        expect(setQuerySpy.calledOnce).toBe(true);
        expect(setQuerySpy.firstCall.args[1]).toEqual({
          query: {
            constant_score: {
              filter: {
                ids: {
                  values: ['id'],
                },
              },
            },
          },
          language: 'lucene',
        });
      });
    });

    it('should set the SearchSource sort order', function () {
      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(() => {
        const setSortSpy = searchSourceStub.setField.withArgs('sort');
        expect(setSortSpy.calledOnce).toBe(true);
        expect(setSortSpy.firstCall.args[1]).toEqual([{ '@timestamp': 'desc' }, { _doc: 'desc' }]);
      });
    });

    it('should reject with an error when no hits were found', function () {
      searchSourceStub._stubHits = [];

      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then(
        () => {
          expect().fail('expected the promise to be rejected');
        },
        (error) => {
          expect(error).toBeInstanceOf(Error);
        }
      );
    });

    it('should return the first hit after adding an anchor marker', function () {
      searchSourceStub._stubHits = [{ property1: 'value1' }, { property2: 'value2' }];

      return fetchAnchor('INDEX_PATTERN_ID', 'id', [
        { '@timestamp': 'desc' },
        { _doc: 'desc' },
      ]).then((anchorDocument) => {
        expect(anchorDocument).toHaveProperty('property1', 'value1');
        expect(anchorDocument).toHaveProperty('$$_isAnchor', true);
      });
    });
  });
});
