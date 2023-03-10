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
import { EuiFlyoutBody } from '@elastic/eui';
import { createAction, IncompatibleActionError, ActionType } from '../../ui_actions';
import { CoreStart } from '../../../../../../core/public';
import { toMountPoint } from '../../../../../opensearch_dashboards_react/public';
import { Embeddable, EmbeddableInput } from '../../embeddables';
import { GetMessageModal } from './get_message_modal';
import { FullNameEmbeddableOutput, hasFullNameOutput } from './say_hello_action';

// Casting to ActionType is a hack - in a real situation use
// declare module and add this id to ActionContextMapping.
export const ACTION_SEND_MESSAGE = 'ACTION_SEND_MESSAGE' as ActionType;

interface ActionContext {
  embeddable: Embeddable<EmbeddableInput, FullNameEmbeddableOutput>;
  message: string;
}

const isCompatible = async (context: ActionContext) => hasFullNameOutput(context.embeddable);

export function createSendMessageAction(overlays: CoreStart['overlays']) {
  const sendMessage = async (context: ActionContext, message: string) => {
    const greeting = `Hello, ${context.embeddable.getOutput().fullName}`;

    const content = message ? `${greeting}. ${message}` : greeting;
    overlays.openFlyout(toMountPoint(<EuiFlyoutBody>{content}</EuiFlyoutBody>));
  };

  return createAction<typeof ACTION_SEND_MESSAGE>({
    type: ACTION_SEND_MESSAGE,
    getDisplayName: () => 'Send message',
    isCompatible,
    execute: async (context: ActionContext) => {
      if (!(await isCompatible(context))) {
        throw new IncompatibleActionError();
      }

      const modal = overlays.openModal(
        toMountPoint(
          <GetMessageModal
            onCancel={() => modal.close()}
            onDone={(message) => {
              modal.close();
              sendMessage(context, message);
            }}
          />
        )
      );
    },
  });
}
