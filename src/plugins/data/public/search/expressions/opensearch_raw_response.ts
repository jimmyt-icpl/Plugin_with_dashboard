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

import { SearchResponse } from 'elasticsearch';
import { ExpressionTypeDefinition } from '../../../../expressions/common';

const name = 'opensearch_raw_response';

export interface OpenSearchRawResponse<T = unknown> {
  type: typeof name;
  body: SearchResponse<T>;
}

// flattens opensearch object into table rows
function flatten(obj: any, keyPrefix = '') {
  let topLevelKeys: Record<string, any> = {};
  const nestedRows: any[] = [];
  const prefix = keyPrefix ? keyPrefix + '.' : '';
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      nestedRows.push(
        ...obj[key]
          .map((nestedRow: any) => flatten(nestedRow, prefix + key))
          .reduce((acc: any, object: any) => [...acc, ...object], [])
      );
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      const subRows = flatten(obj[key], prefix + key);
      if (subRows.length === 1) {
        topLevelKeys = { ...topLevelKeys, ...subRows[0] };
      } else {
        nestedRows.push(...subRows);
      }
    } else {
      topLevelKeys[prefix + key] = obj[key];
    }
  });
  if (nestedRows.length === 0) {
    return [topLevelKeys];
  } else {
    return nestedRows.map((nestedRow) => ({ ...nestedRow, ...topLevelKeys }));
  }
}

const parseRawDocs = (hits: SearchResponse<unknown>['hits']) => {
  return hits.hits.map((hit) => hit.fields || hit._source).filter((hit) => hit);
};

const convertResult = (body: SearchResponse<unknown>) => {
  return !body.aggregations ? parseRawDocs(body.hits) : flatten(body.aggregations);
};

export type OpenSearchRawResponseExpressionTypeDefinition = ExpressionTypeDefinition<
  typeof name,
  OpenSearchRawResponse,
  OpenSearchRawResponse
>;

export const opensearchRawResponse: OpenSearchRawResponseExpressionTypeDefinition = {
  name,
  to: {
    datatable: (context: OpenSearchRawResponse) => {
      const rows = convertResult(context.body);
      const columns = rows.length
        ? Object.keys(rows[0]).map((key) => ({
            id: key,
            name: key,
            meta: {
              type: typeof rows[0][key],
              field: key,
              params: {},
            },
          }))
        : [];

      return {
        type: 'datatable',
        meta: {
          type: 'opensearchdsl',
          source: '*',
        },
        columns,
        rows,
      };
    },
  },
};
