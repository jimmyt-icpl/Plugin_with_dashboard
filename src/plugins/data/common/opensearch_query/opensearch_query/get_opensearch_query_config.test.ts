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

import { get } from 'lodash';
import { getOpenSearchQueryConfig } from './get_opensearch_query_config';
import { IUiSettingsClient } from 'opensearch-dashboards/public';
import { UI_SETTINGS } from '../..';

const config = ({
  get(item: string) {
    return get(config, item);
  },
  [UI_SETTINGS.QUERY_ALLOW_LEADING_WILDCARDS]: {
    allowLeadingWildcards: true,
  },
  [UI_SETTINGS.QUERY_STRING_OPTIONS]: {
    queryStringOptions: {},
  },
  [UI_SETTINGS.COURIER_IGNORE_FILTER_IF_FIELD_NOT_IN_INDEX]: {
    ignoreFilterIfFieldNotInIndex: true,
  },
  'dateFormat:tz': {
    dateFormatTZ: 'Browser',
  },
} as unknown) as IUiSettingsClient;

describe('getOpenSearchQueryConfig', () => {
  test('should return the parameters of an OpenSearch query config requested', () => {
    const result = getOpenSearchQueryConfig(config);
    const expected = {
      allowLeadingWildcards: {
        allowLeadingWildcards: true,
      },
      dateFormatTZ: {
        dateFormatTZ: 'Browser',
      },
      ignoreFilterIfFieldNotInIndex: {
        ignoreFilterIfFieldNotInIndex: true,
      },
      queryStringOptions: {
        queryStringOptions: {},
      },
    };

    expect(result).toEqual(expected);

    expect(result).toHaveProperty('allowLeadingWildcards');
    expect(result).toHaveProperty('dateFormatTZ');
    expect(result).toHaveProperty('ignoreFilterIfFieldNotInIndex');
    expect(result).toHaveProperty('queryStringOptions');
  });
});
