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
import { i18n } from '@osd/i18n';

import { IFieldType, TimefilterContract, DataPublicPluginStart } from 'src/plugins/data/public';
import { Control, noValuesDisableMsg, noIndexPatternMsg } from './control';
import { RangeFilterManager } from './filter_manager/range_filter_manager';
import { createSearchSource } from './create_search_source';
import { ControlParams } from '../editor_utils';
import { InputControlVisDependencies } from '../plugin';

const minMaxAgg = (field?: IFieldType) => {
  const aggBody: any = {};
  if (field) {
    if (field.scripted) {
      aggBody.script = {
        source: field.script,
        lang: field.lang,
      };
    } else {
      aggBody.field = field.name;
    }
  }

  return {
    maxAgg: {
      max: aggBody,
    },
    minAgg: {
      min: aggBody,
    },
  };
};

export class RangeControl extends Control<RangeFilterManager> {
  private searchSource: DataPublicPluginStart['search']['searchSource'];

  timefilter: TimefilterContract;
  abortController: any;
  min: any;
  max: any;

  constructor(
    controlParams: ControlParams,
    filterManager: RangeFilterManager,
    useTimeFilter: boolean,
    searchSource: DataPublicPluginStart['search']['searchSource'],
    deps: InputControlVisDependencies
  ) {
    super(controlParams, filterManager, useTimeFilter);
    this.timefilter = deps.data.query.timefilter.timefilter;
    this.searchSource = searchSource;
  }

  async fetch() {
    // Abort any in-progress fetch
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const indexPattern = this.filterManager.getIndexPattern();
    if (!indexPattern) {
      this.disable(noIndexPatternMsg(this.controlParams.indexPattern));
      return;
    }

    const fieldName = this.filterManager.fieldName;
    const aggs = minMaxAgg(indexPattern.fields.getByName(fieldName));
    const searchSource = await createSearchSource(
      this.searchSource,
      null,
      indexPattern,
      aggs,
      this.useTimeFilter,
      [],
      this.timefilter
    );
    const abortSignal = this.abortController.signal;

    let resp;
    try {
      resp = await searchSource.fetch({ abortSignal });
    } catch (error) {
      // If the fetch was aborted then no need to surface this error in the UI
      if (error.name === 'AbortError') return;
      this.disable(
        i18n.translate('inputControl.rangeControl.unableToFetchTooltip', {
          defaultMessage: 'Unable to fetch range min and max, error: {errorMessage}',
          values: { errorMessage: error.message },
        })
      );
      return;
    }

    const min = _.get(resp, 'aggregations.minAgg.value', null);
    const max = _.get(resp, 'aggregations.maxAgg.value', null);

    if (min === null || max === null) {
      this.disable(noValuesDisableMsg(fieldName, indexPattern.title));
      return;
    }

    this.min = min;
    this.max = max;
    this.enable = true;
  }

  destroy() {
    if (this.abortController) this.abortController.abort();
  }
}

export async function rangeControlFactory(
  controlParams: ControlParams,
  useTimeFilter: boolean,
  deps: InputControlVisDependencies
): Promise<RangeControl> {
  const [, { data: dataPluginStart }] = await deps.core.getStartServices();
  const indexPattern = await dataPluginStart.indexPatterns.get(controlParams.indexPattern);

  return new RangeControl(
    controlParams,
    new RangeFilterManager(
      controlParams.id,
      controlParams.fieldName,
      indexPattern,
      deps.data.query.filterManager
    ),
    useTimeFilter,
    dataPluginStart.search.searchSource,
    deps
  );
}
