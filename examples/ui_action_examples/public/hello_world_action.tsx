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

import React from 'react';
import { EuiText, EuiModalBody, EuiButton } from '@elastic/eui';
import { OverlayStart } from '../../../src/core/public';
import { createAction } from '../../../src/plugins/ui_actions/public';
import { toMountPoint } from '../../../src/plugins/opensearch_dashboards_react/public';

export const ACTION_HELLO_WORLD = 'ACTION_HELLO_WORLD';

interface StartServices {
  openModal: OverlayStart['openModal'];
}

export const createHelloWorldAction = (getStartServices: () => Promise<StartServices>) =>
  createAction({
    type: ACTION_HELLO_WORLD,
    getDisplayName: () => 'Hello World!',
    execute: async () => {
      const { openModal } = await getStartServices();
      const overlay = openModal(
        toMountPoint(
          <EuiModalBody>
            <EuiText data-test-subj="helloWorldActionText">Hello world!</EuiText>
            <EuiButton data-test-subj="closeModal" onClick={() => overlay.close()}>
              Close
            </EuiButton>
          </EuiModalBody>
        )
      );
    },
  });
