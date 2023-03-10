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

import * as React from 'react';
import { OpenSearchDashboardsServices } from '../context/types';
import { OpenSearchDashboardsReactNotifications } from './types';
import { toMountPoint } from '../util';

export const createNotifications = (
  services: OpenSearchDashboardsServices
): OpenSearchDashboardsReactNotifications => {
  const show: OpenSearchDashboardsReactNotifications['toasts']['show'] = ({
    title,
    body,
    color,
    iconType,
    toastLifeTimeMs,
    onClose,
  }) => {
    if (!services.notifications) {
      throw new TypeError('Could not show notification as notifications service is not available.');
    }
    services.notifications!.toasts.add({
      title: toMountPoint(title),
      text: toMountPoint(<>{body || null}</>),
      color,
      iconType,
      toastLifeTimeMs,
      onClose,
    });
  };

  const success: OpenSearchDashboardsReactNotifications['toasts']['success'] = (input) =>
    show({ color: 'success', iconType: 'check', ...input });

  const warning: OpenSearchDashboardsReactNotifications['toasts']['warning'] = (input) =>
    show({ color: 'warning', iconType: 'help', ...input });

  const danger: OpenSearchDashboardsReactNotifications['toasts']['danger'] = (input) =>
    show({ color: 'danger', iconType: 'alert', ...input });

  const notifications: OpenSearchDashboardsReactNotifications = {
    toasts: {
      show,
      success,
      warning,
      danger,
    },
  };

  return notifications;
};
