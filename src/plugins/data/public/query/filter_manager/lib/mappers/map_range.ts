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

import { get, hasIn } from 'lodash';
import {
  FilterValueFormatter,
  RangeFilter,
  isScriptedRangeFilter,
  isRangeFilter,
  Filter,
  FILTERS,
} from '../../../../../common';

const getFormattedValueFn = (left: any, right: any) => {
  return (formatter?: FilterValueFormatter) => {
    let displayValue = `${left} to ${right}`;
    if (formatter) {
      const convert = formatter.getConverterFor('text');
      displayValue = `${convert(left)} to ${convert(right)}`;
    }
    return displayValue;
  };
};

const getFirstRangeKey = (filter: RangeFilter) => filter.range && Object.keys(filter.range)[0];
const getRangeByKey = (filter: RangeFilter, key: string) => get(filter, ['range', key]);

function getParams(filter: RangeFilter) {
  const isScriptedRange = isScriptedRangeFilter(filter);
  const key: string = (isScriptedRange ? filter.meta.field : getFirstRangeKey(filter)) || '';
  const params: any = isScriptedRange
    ? get(filter, 'script.script.params')
    : getRangeByKey(filter, key);

  let left = hasIn(params, 'gte') ? params.gte : params.gt;
  if (left == null) left = -Infinity;

  let right = hasIn(params, 'lte') ? params.lte : params.lt;
  if (right == null) right = Infinity;

  const value = getFormattedValueFn(left, right);

  return { type: FILTERS.RANGE, key, value, params };
}

export const isMapRangeFilter = (filter: any): filter is RangeFilter =>
  isRangeFilter(filter) || isScriptedRangeFilter(filter);

export const mapRange = (filter: Filter) => {
  if (!isMapRangeFilter(filter)) {
    throw filter;
  }

  return getParams(filter);
};
