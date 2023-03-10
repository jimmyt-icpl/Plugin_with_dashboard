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

import { parseSettings } from './parse_settings';

describe('parseSettings', () => {
  test('returns the true for "true"', () => {
    const settings = 'pad=true';
    expect(parseSettings(settings)).toEqual({
      pad: true,
    });
  });

  test('returns the false for "false"', () => {
    const settings = 'pad=false';
    expect(parseSettings(settings)).toEqual({
      pad: false,
    });
  });

  test('returns the true for 1', () => {
    const settings = 'pad=1';
    expect(parseSettings(settings)).toEqual({
      pad: true,
    });
  });

  test('returns the false for 0', () => {
    const settings = 'pad=0';
    expect(parseSettings(settings)).toEqual({
      pad: false,
    });
  });

  test('returns the settings as an object', () => {
    const settings = 'alpha=0.9 beta=0.4 gamma=0.2 period=5 pad=false type=add';
    expect(parseSettings(settings)).toEqual({
      alpha: 0.9,
      beta: 0.4,
      gamma: 0.2,
      period: 5,
      pad: false,
      type: 'add',
    });
  });
});
