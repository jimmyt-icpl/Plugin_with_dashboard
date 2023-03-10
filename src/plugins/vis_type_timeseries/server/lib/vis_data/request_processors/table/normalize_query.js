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

import _ from 'lodash';
import { overwrite } from '../../helpers';
const isEmptyFilter = (filter = {}) => Boolean(filter.match_all) && _.isEmpty(filter.match_all);
const hasSiblingPipelineAggregation = (aggs = {}) => Object.keys(aggs).length > 1;

/* Last query handler in the chain. You can use this handler
 * as the last place where you can modify the "doc" (request body) object before sending it to OpenSearch.

 * Important: for Sibling Pipeline aggregation we cannot apply this logic
 *
 */
export function normalizeQuery() {
  return () => (doc) => {
    const series = _.get(doc, 'aggs.pivot.aggs');
    const normalizedSeries = {};

    _.forEach(series, (value, seriesId) => {
      const filter = _.get(value, `filter`);

      if (isEmptyFilter(filter) && !hasSiblingPipelineAggregation(value.aggs)) {
        const agg = _.get(value, 'aggs.timeseries');
        const meta = {
          ..._.get(value, 'meta'),
          seriesId,
        };
        overwrite(normalizedSeries, `${seriesId}`, agg);
        overwrite(normalizedSeries, `${seriesId}.meta`, meta);
      } else {
        overwrite(normalizedSeries, `${seriesId}`, value);
      }
    });

    overwrite(doc, 'aggs.pivot.aggs', normalizedSeries);

    return doc;
  };
}
