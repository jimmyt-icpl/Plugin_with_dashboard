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

import handlebars from 'handlebars/dist/handlebars';
import { isNumber } from 'lodash';
import { inputFormats, outputFormats, isDuration } from '../lib/durations';
import { getFieldFormats } from '../../../services';

export const createTickFormatter = (format = '0,0.[00]', template, getConfig = null) => {
  const fieldFormats = getFieldFormats();

  if (!template) template = '{{value}}';
  const render = handlebars.compile(template, { knownHelpersOnly: true });
  let formatter;

  if (isDuration(format)) {
    const [from, to, decimals] = format.split(',');
    const DurationFormat = fieldFormats.getType('duration');

    formatter = new DurationFormat({
      inputFormat: inputFormats[from],
      outputFormat: outputFormats[to],
      outputPrecision: decimals,
    });
  } else {
    let FieldFormat = fieldFormats.getType(format);
    if (FieldFormat) {
      formatter = new FieldFormat(null, getConfig);
    } else {
      FieldFormat = fieldFormats.getType('number');
      formatter = new FieldFormat({ pattern: format }, getConfig);
    }
  }
  return (val) => {
    let value;
    if (!isNumber(val)) {
      value = val;
    } else {
      try {
        value = formatter.convert(val, 'text');
      } catch (e) {
        value = val;
      }
    }
    try {
      return render({ value });
    } catch (e) {
      return String(value);
    }
  };
};
