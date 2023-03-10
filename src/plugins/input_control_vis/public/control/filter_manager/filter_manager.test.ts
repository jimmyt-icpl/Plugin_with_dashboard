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

import expect from '@osd/expect';

import { FilterManager } from './filter_manager';
import { coreMock } from '../../../../../core/public/mocks';
import { Filter, IndexPattern, FilterManager as QueryFilterManager } from '../../../../data/public';

const setupMock = coreMock.createSetup();

class FilterManagerTest extends FilterManager {
  createFilter() {
    return {} as Filter;
  }

  getValueFromFilterBar() {
    return null;
  }
}

describe('FilterManager', function () {
  const controlId = 'control1';

  describe('findFilters', function () {
    const indexPatternMock = {} as IndexPattern;
    let osdFilters: Filter[];
    const queryFilterMock = new QueryFilterManager(setupMock.uiSettings);
    queryFilterMock.getAppFilters = () => osdFilters;
    queryFilterMock.getGlobalFilters = () => [];

    let filterManager: FilterManagerTest;
    beforeEach(() => {
      osdFilters = [];
      filterManager = new FilterManagerTest(controlId, 'field1', indexPatternMock, queryFilterMock);
    });

    test('should not find filters that are not controlled by any visualization', function () {
      osdFilters.push({} as Filter);
      const foundFilters = filterManager.findFilters();
      expect(foundFilters.length).to.be(0);
    });

    test('should not find filters that are controlled by other Visualizations', function () {
      osdFilters.push({
        meta: {
          controlledBy: 'anotherControl',
        },
      } as Filter);
      const foundFilters = filterManager.findFilters();
      expect(foundFilters.length).to.be(0);
    });

    test('should find filter that is controlled by target Visualization', function () {
      osdFilters.push({
        meta: {
          controlledBy: controlId,
        },
      } as Filter);
      const foundFilters = filterManager.findFilters();
      expect(foundFilters.length).to.be(1);
    });
  });
});
