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

import { DurationFormat } from './duration';

describe('Duration Format', () => {
  testCase({
    inputFormat: 'seconds',
    outputFormat: 'humanize',
    outputPrecision: undefined,
    showSuffix: undefined,
    fixtures: [
      {
        input: -60,
        output: 'minus a minute',
      },
      {
        input: 1,
        output: 'a few seconds',
      },
      {
        input: 60,
        output: 'a minute',
      },
      {
        input: 125,
        output: '2 minutes',
      },
    ],
  });

  testCase({
    inputFormat: 'minutes',
    outputFormat: 'humanize',
    outputPrecision: undefined,
    showSuffix: undefined,
    fixtures: [
      {
        input: -60,
        output: 'minus an hour',
      },
      {
        input: 60,
        output: 'an hour',
      },
      {
        input: 125,
        output: '2 hours',
      },
    ],
  });

  testCase({
    inputFormat: 'minutes',
    outputFormat: 'asHours',
    outputPrecision: undefined,
    showSuffix: undefined,
    fixtures: [
      {
        input: -60,
        output: '-1.00',
      },
      {
        input: 60,
        output: '1.00',
      },
      {
        input: 125,
        output: '2.08',
      },
    ],
  });

  testCase({
    inputFormat: 'seconds',
    outputFormat: 'asSeconds',
    outputPrecision: 0,
    showSuffix: undefined,
    fixtures: [
      {
        input: -60,
        output: '-60',
      },
      {
        input: 60,
        output: '60',
      },
      {
        input: 125,
        output: '125',
      },
    ],
  });

  testCase({
    inputFormat: 'seconds',
    outputFormat: 'asSeconds',
    outputPrecision: 2,
    showSuffix: undefined,
    fixtures: [
      {
        input: -60,
        output: '-60.00',
      },
      {
        input: -32.333,
        output: '-32.33',
      },
      {
        input: 60,
        output: '60.00',
      },
      {
        input: 125,
        output: '125.00',
      },
    ],
  });

  testCase({
    inputFormat: 'seconds',
    outputFormat: 'asSeconds',
    outputPrecision: 0,
    showSuffix: true,
    fixtures: [
      {
        input: -60,
        output: '-60 Seconds',
      },
      {
        input: -32.333,
        output: '-32 Seconds',
      },
    ],
  });

  function testCase({
    inputFormat,
    outputFormat,
    outputPrecision,
    showSuffix,
    fixtures,
  }: {
    inputFormat: string;
    outputFormat: string;
    outputPrecision: number | undefined;
    showSuffix: boolean | undefined;
    fixtures: any[];
  }) {
    fixtures.forEach((fixture: Record<string, any>) => {
      const input = fixture.input;
      const output = fixture.output;

      test(`should format ${input} ${inputFormat} through ${outputFormat}${
        outputPrecision ? `, ${outputPrecision} decimals` : ''
      }`, () => {
        const duration = new DurationFormat(
          { inputFormat, outputFormat, outputPrecision, showSuffix },
          jest.fn()
        );
        expect(duration.convert(input)).toBe(output);
      });
    });
  }
});
