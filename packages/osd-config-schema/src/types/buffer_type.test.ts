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

import { schema } from '..';

test('returns value by default', () => {
  const value = Buffer.from('Hi!');
  expect(schema.buffer().validate(value)).toStrictEqual(value);
});

test('is required by default', () => {
  expect(() => schema.buffer().validate(undefined)).toThrowErrorMatchingInlineSnapshot(
    `"expected value of type [Buffer] but got [undefined]"`
  );
});

test('includes namespace in failure', () => {
  expect(() =>
    schema.buffer().validate(undefined, {}, 'foo-namespace')
  ).toThrowErrorMatchingInlineSnapshot(
    `"[foo-namespace]: expected value of type [Buffer] but got [undefined]"`
  );
});

describe('#defaultValue', () => {
  test('returns default when undefined', () => {
    const value = Buffer.from('Hi!');
    expect(schema.buffer({ defaultValue: value }).validate(undefined)).toStrictEqual(value);
  });

  test('returns value when specified', () => {
    const value = Buffer.from('Hi!');
    expect(schema.buffer({ defaultValue: Buffer.from('Bye!') }).validate(value)).toStrictEqual(
      value
    );
  });
});

test('returns error when not a buffer', () => {
  expect(() => schema.buffer().validate(123)).toThrowErrorMatchingInlineSnapshot(
    `"expected value of type [Buffer] but got [number]"`
  );

  expect(() => schema.buffer().validate([1, 2, 3])).toThrowErrorMatchingInlineSnapshot(
    `"expected value of type [Buffer] but got [Array]"`
  );

  expect(() => schema.buffer().validate('abc')).toThrowErrorMatchingInlineSnapshot(
    `"expected value of type [Buffer] but got [string]"`
  );
});
