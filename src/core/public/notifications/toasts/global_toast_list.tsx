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

import { EuiGlobalToastList, EuiGlobalToastListToast as EuiToast } from '@elastic/eui';
import React from 'react';
import * as Rx from 'rxjs';
import { i18n } from '@osd/i18n';

import { MountWrapper } from '../../utils';
import { Toast } from './toasts_api';

interface Props {
  toasts$: Rx.Observable<Toast[]>;
  dismissToast: (toastId: string) => void;
}

interface State {
  toasts: Toast[];
}

const convertToEui = (toast: Toast): EuiToast => ({
  ...toast,
  title: typeof toast.title === 'function' ? <MountWrapper mount={toast.title} /> : toast.title,
  text: typeof toast.text === 'function' ? <MountWrapper mount={toast.text} /> : toast.text,
});

export class GlobalToastList extends React.Component<Props, State> {
  public state: State = {
    toasts: [],
  };

  private subscription?: Rx.Subscription;

  public componentDidMount() {
    this.subscription = this.props.toasts$.subscribe((toasts) => {
      this.setState({ toasts });
    });
  }

  public componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public render() {
    return (
      <EuiGlobalToastList
        aria-label={i18n.translate('core.notifications.globalToast.ariaLabel', {
          defaultMessage: 'Notification message list',
        })}
        data-test-subj="globalToastList"
        toasts={this.state.toasts.map(convertToEui)}
        dismissToast={({ id }) => this.props.dismissToast(id)}
        /**
         * This prop is overriden by the individual toasts that are added.
         * Use `Infinity` here so that it's obvious a timeout hasn't been
         * provided in development.
         */
        toastLifeTimeMs={Infinity}
      />
    );
  }
}
