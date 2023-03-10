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
import { render, unmountComponentAtNode } from 'react-dom';
import { Plugin, CoreSetup } from 'opensearch-dashboards/public';

export class RenderingPlugin implements Plugin {
  public setup(core: CoreSetup) {
    core.application.register({
      id: 'rendering',
      title: 'Rendering',
      appRoute: '/render/core',
      async mount(context, { element }) {
        render(<h1 data-test-subj="renderingHeader">rendering service</h1>, element);

        return () => unmountComponentAtNode(element);
      },
    });

    core.application.register({
      id: 'custom-app-route',
      title: 'Custom App Route',
      appRoute: '/custom/appRoute',
      async mount(context, { element }) {
        render(<h1 data-test-subj="customAppRouteHeader">Custom App Route</h1>, element);

        return () => unmountComponentAtNode(element);
      },
    });
  }

  public start() {}

  public stop() {}
}
