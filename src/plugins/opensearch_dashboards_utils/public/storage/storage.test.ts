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

import { Storage } from './storage';
import { IStorage, IStorageWrapper } from './types';

const payload = { first: 'john', last: 'smith' };
const createMockStore = (): MockedKeys<IStorage> => {
  let store: Record<string, any> = {};
  return {
    getItem: jest.fn().mockImplementation((key) => store[key]),
    setItem: jest.fn().mockImplementation((key, value) => (store[key] = value)),
    removeItem: jest.fn().mockImplementation((key: string) => delete store[key]),
    clear: jest.fn().mockImplementation(() => (store = {})),
  };
};

describe('StorageService', () => {
  let storage: IStorageWrapper;
  let mockStore: MockedKeys<IStorage>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockStore = createMockStore();
    storage = new Storage(mockStore);
  });

  describe('expected API', () => {
    test('should have expected methods', () => {
      expect(typeof storage.get).toBe('function');
      expect(typeof storage.set).toBe('function');
      expect(typeof storage.remove).toBe('function');
      expect(typeof storage.clear).toBe('function');
    });
  });

  describe('call behavior', () => {
    test('should call getItem on the store', () => {
      storage.get('name');

      expect(mockStore.getItem).toHaveBeenCalledTimes(1);
    });

    test('should call setItem on the store', () => {
      storage.set('name', 'john smith');

      expect(mockStore.setItem).toHaveBeenCalledTimes(1);
    });

    test('should call removeItem on the store', () => {
      storage.remove('name');

      expect(mockStore.removeItem).toHaveBeenCalledTimes(1);
    });

    test('should call clear on the store', () => {
      storage.clear();

      expect(mockStore.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('json data', () => {
    test('should parse JSON when reading from the store', () => {
      mockStore.getItem = jest.fn().mockImplementationOnce(() => JSON.stringify(payload));

      const data = storage.get('name');
      expect(data).toEqual(payload);
    });

    test('should write JSON string to the store', () => {
      const key = 'name';
      const value = payload;

      storage.set(key, value);
      expect(mockStore.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });

  describe('expected responses', () => {
    test('should return null when not exists', () => {
      const data = storage.get('notexists');
      expect(data).toBe(null);
    });

    test('should return null when invalid JSON', () => {
      mockStore.getItem = jest.fn().mockImplementationOnce(() => 'not: json');

      const data = storage.get('name');
      expect(data).toBe(null);
    });
  });
});
