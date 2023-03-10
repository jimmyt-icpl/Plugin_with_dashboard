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

import { CoreSetup } from 'opensearch-dashboards/public';
import { EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
import React from 'react';

import { IEmbeddable } from '../../../../../src/plugins/embeddable/public';
import { createAction, ActionType } from '../../../../../src/plugins/ui_actions/public';
import { toMountPoint } from '../../../../../src/plugins/opensearch_dashboards_react/public';

// Casting to ActionType is a hack - in a real situation use
// declare module and add this id to ActionContextMapping.
export const SAMPLE_PANEL_ACTION = 'samplePanelAction' as ActionType;

export interface SamplePanelActionContext {
  embeddable: IEmbeddable;
}

export function createSamplePanelAction(getStartServices: CoreSetup['getStartServices']) {
  return createAction<typeof SAMPLE_PANEL_ACTION>({
    type: SAMPLE_PANEL_ACTION,
    getDisplayName: () => 'Sample Panel Action',
    execute: async ({ embeddable }: SamplePanelActionContext) => {
      if (!embeddable) {
        return;
      }
      const openFlyout = (await getStartServices())[0].overlays.openFlyout;
      openFlyout(
        toMountPoint(
          <React.Fragment>
            <EuiFlyoutHeader>
              <EuiTitle size="m" data-test-subj="samplePanelActionTitle">
                <h1>{embeddable.getTitle()}</h1>
              </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody>
              <h3 data-test-subj="samplePanelActionBody">This is a sample action</h3>
            </EuiFlyoutBody>
          </React.Fragment>
        ),
        {
          'data-test-subj': 'samplePanelActionFlyout',
        }
      );
    },
  });
}
