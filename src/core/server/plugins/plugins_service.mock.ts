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

import type { PublicMethodsOf } from '@osd/utility-types';
import { PluginsService, PluginsServiceSetup } from './plugins_service';

type PluginsServiceMock = jest.Mocked<PublicMethodsOf<PluginsService>>;

const createSetupContractMock = (): PluginsServiceSetup => ({
  contracts: new Map(),
  initialized: true,
});
const createStartContractMock = () => ({ contracts: new Map() });

const createServiceMock = (): PluginsServiceMock => ({
  discover: jest.fn(),
  setup: jest.fn().mockResolvedValue(createSetupContractMock()),
  start: jest.fn().mockResolvedValue(createStartContractMock()),
  stop: jest.fn(),
});

function createUiPlugins() {
  return {
    browserConfigs: new Map(),
    internal: new Map(),
    public: new Map(),
  };
}

export const pluginServiceMock = {
  create: createServiceMock,
  createSetupContract: createSetupContractMock,
  createStartContract: createStartContractMock,
  createUiPlugins,
};
