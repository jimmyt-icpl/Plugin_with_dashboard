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

import { Action, createAction, ActionType } from '../../../../../src/plugins/ui_actions/public';

// Casting to ActionType is a hack - in a real situation use
// declare module and add this id to ActionContextMapping.
export const SAMPLE_PANEL_LINK = 'samplePanelLink' as ActionType;

export const createSamplePanelLink = (): Action =>
  createAction<typeof SAMPLE_PANEL_LINK>({
    type: SAMPLE_PANEL_LINK,
    getDisplayName: () => 'Sample panel Link',
    execute: async () => {
      window.location.href = 'https://example.com/opensearch-dashboards/test';
    },
    getHref: async () => 'https://example.com/opensearch-dashboards/test',
  });
