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
import dateMath, { Unit } from '@elastic/datemath';

import { parseOpenSearchInterval } from '../../../utils';

const unitsDesc = dateMath.unitsDesc;
const largeMax = unitsDesc.indexOf('M');

export interface OpenSearchInterval {
  expression: string;
  unit: Unit;
  value: number;
}

/**
 * Convert a moment.duration into an opensearch
 * compatible expression, and provide
 * associated metadata
 *
 * @param  {moment.duration} duration
 * @return {object}
 */
export function convertDurationToNormalizedOpenSearchInterval(
  duration: moment.Duration
): OpenSearchInterval {
  for (let i = 0; i < unitsDesc.length; i++) {
    const unit = unitsDesc[i];
    const val = duration.as(unit);
    // find a unit that rounds neatly
    if (val >= 1 && Math.floor(val) === val) {
      // if the unit is "large", like years, but
      // isn't set to 1 OpenSearch will puke. So keep going until
      // we get out of the "large" units
      if (i <= largeMax && val !== 1) {
        continue;
      }

      return {
        value: val,
        unit,
        expression: val + unit,
      };
    }
  }

  const ms = duration.as('ms');
  return {
    value: ms,
    unit: 'ms',
    expression: ms + 'ms',
  };
}

export function convertIntervalToOpenSearchInterval(interval: string): OpenSearchInterval {
  const { value, unit } = parseOpenSearchInterval(interval);
  return {
    value,
    unit,
    expression: interval,
  };
}
