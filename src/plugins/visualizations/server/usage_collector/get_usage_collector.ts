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

import { Observable } from 'rxjs';
import { countBy, get, groupBy, mapValues, max, min, values } from 'lodash';
import { first } from 'rxjs/operators';
import { SearchResponse } from 'elasticsearch';

import { LegacyAPICaller } from 'src/core/server';
import { getPastDays } from './get_past_days';

const VIS_USAGE_TYPE = 'visualization_types';

type OpenSearchResponse = SearchResponse<{ visualization: { visState: string } }>;

interface VisSummary {
  type: string;
  space: string;
  past_days: number;
}

/*
 * Parse the response data into telemetry payload
 */
async function getStats(callCluster: LegacyAPICaller, index: string) {
  const searchParams = {
    size: 10000, // opensearch index.max_result_window default value
    index,
    ignoreUnavailable: true,
    filterPath: [
      'hits.hits._id',
      'hits.hits._source.visualization',
      'hits.hits._source.updated_at',
    ],
    body: {
      query: {
        bool: { filter: { term: { type: 'visualization' } } },
      },
    },
  };
  const opensearchResponse: OpenSearchResponse = await callCluster('search', searchParams);
  const size = get(opensearchResponse, 'hits.hits.length', 0);
  if (size < 1) {
    return;
  }

  // `map` to get the raw types
  const visSummaries: VisSummary[] = opensearchResponse.hits.hits.map((hit) => {
    const spacePhrases = hit._id.split(':');
    const lastUpdated: string = get(hit, '_source.updated_at');
    const space = spacePhrases.length === 3 ? spacePhrases[0] : 'default'; // if in a custom space, the format of a saved object ID is space:type:id
    const visualization = get(hit, '_source.visualization', { visState: '{}' });
    const visState: { type?: string } = JSON.parse(visualization.visState);
    return {
      type: visState.type || '_na_',
      space,
      past_days: getPastDays(lastUpdated),
    };
  });

  // organize stats per type
  const visTypes = groupBy(visSummaries, 'type');

  // get the final result
  return mapValues(visTypes, (curr) => {
    const total = curr.length;
    const spacesBreakdown = countBy(curr, 'space');
    const spaceCounts: number[] = values(spacesBreakdown);

    return {
      total,
      spaces_min: min(spaceCounts),
      spaces_max: max(spaceCounts),
      spaces_avg: total / spaceCounts.length,
      saved_7_days_total: curr.filter((c) => c.past_days <= 7).length,
      saved_30_days_total: curr.filter((c) => c.past_days <= 30).length,
      saved_90_days_total: curr.filter((c) => c.past_days <= 90).length,
    };
  });
}

export function getUsageCollector(config: Observable<{ opensearchDashboards: { index: string } }>) {
  return {
    type: VIS_USAGE_TYPE,
    isReady: () => true,
    fetch: async (callCluster: LegacyAPICaller) => {
      const index = (await config.pipe(first()).toPromise()).opensearchDashboards.index;
      return await getStats(callCluster, index);
    },
  };
}
