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

import React, { Component, RefObject } from 'react';
import { Subscription } from 'rxjs';

import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { IContainer, PanelState, EmbeddableChildPanel } from '../..';
import { EmbeddableStart } from '../../../plugin';

interface Props {
  container: IContainer;
  panelComponent: EmbeddableStart['EmbeddablePanel'];
}

interface State {
  panels: { [key: string]: PanelState };
  loaded: { [key: string]: boolean };
}

export class HelloWorldContainerComponent extends Component<Props, State> {
  private roots: { [key: string]: RefObject<HTMLDivElement> } = {};
  private mounted: boolean = false;
  private inputSubscription?: Subscription;
  private outputSubscription?: Subscription;

  constructor(props: Props) {
    super(props);

    Object.values(this.props.container.getInput().panels).forEach((panelState) => {
      this.roots[panelState.explicitInput.id] = React.createRef();
    });

    this.state = {
      loaded: this.props.container.getOutput().embeddableLoaded,
      panels: this.props.container.getInput().panels,
    };
  }

  public async componentDidMount() {
    this.mounted = true;

    this.inputSubscription = this.props.container.getInput$().subscribe(() => {
      if (this.mounted) {
        this.setState({ panels: this.props.container.getInput().panels });
      }
    });

    this.outputSubscription = this.props.container.getOutput$().subscribe(() => {
      if (this.mounted) {
        this.setState({ loaded: this.props.container.getOutput().embeddableLoaded });
      }
    });
  }

  public componentWillUnmount() {
    this.mounted = false;
    this.props.container.destroy();

    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }

    if (this.outputSubscription) {
      this.outputSubscription.unsubscribe();
    }
  }

  public render() {
    return (
      <div>
        <h2>HELLO WORLD! These are my precious embeddable children:</h2>
        <EuiSpacer size="l" />
        <EuiFlexGroup>{this.renderList()}</EuiFlexGroup>
      </div>
    );
  }

  private renderList() {
    const list = Object.values(this.state.panels).map((panelState) => {
      const item = (
        <EuiFlexItem key={panelState.explicitInput.id}>
          <EmbeddableChildPanel
            container={this.props.container}
            embeddableId={panelState.explicitInput.id}
            PanelComponent={this.props.panelComponent}
          />
        </EuiFlexItem>
      );
      return item;
    });
    return list;
  }
}
