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

import { EuiFlexGroup, EuiSpacer, EuiFlexItem, EuiText, EuiPanel } from '@elastic/eui';
import {
  IContainer,
  withEmbeddableSubscription,
  ContainerInput,
  ContainerOutput,
  EmbeddableStart,
} from '../../../../src/plugins/embeddable/public';

interface Props {
  embeddable: IContainer;
  input: ContainerInput;
  output: ContainerOutput;
  embeddableServices: EmbeddableStart;
}

function renderList(
  embeddable: IContainer,
  panels: ContainerInput['panels'],
  embeddableServices: EmbeddableStart
) {
  let number = 0;
  const list = Object.values(panels).map((panel) => {
    const child = embeddable.getChild(panel.explicitInput.id);
    number++;
    return (
      <EuiPanel key={number.toString()}>
        <EuiFlexGroup gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiText>
              <h3>{number}</h3>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <embeddableServices.EmbeddablePanel embeddable={child} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  });
  return list;
}

export function ListContainerComponentInner({ embeddable, input, embeddableServices }: Props) {
  return (
    <div>
      <h2 data-test-subj="listContainerTitle">{embeddable.getTitle()}</h2>
      <EuiSpacer size="l" />
      {renderList(embeddable, input.panels, embeddableServices)}
    </div>
  );
}

// You don't have to use this helper wrapper, but it handles a lot of the React boilerplate for
// embeddables, like setting up the subscriptions to cause the component to refresh whenever
// anything on input or output state changes.  If you don't want that to happen (for example
// if you expect something on input or output state to change frequently that your react
// component does not care about, then you should probably hook this up manually).
export const ListContainerComponent = withEmbeddableSubscription<
  ContainerInput,
  ContainerOutput,
  IContainer,
  { embeddableServices: EmbeddableStart }
>(ListContainerComponentInner);
