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

import { toUser } from '../';

describe('user input helpers', () => {
  describe('model presentation formatter', () => {
    test('should present objects as strings', () => {
      expect(toUser({ foo: 'bar' })).toBe('{"foo":"bar"}');
    });

    test('should present query_string queries as strings', () => {
      expect(toUser({ query_string: { query: 'lucene query string' } })).toBe(
        'lucene query string'
      );
    });

    test('should present query_string queries without a query as an empty string', () => {
      expect(toUser({ query_string: {} })).toBe('');
    });

    test('should present string as strings', () => {
      expect(toUser('foo')).toBe('foo');
    });

    test('should present numbers as strings', () => {
      expect(toUser(400)).toBe('400');
    });
  });
});
