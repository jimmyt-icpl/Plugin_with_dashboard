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
import { StatusService } from './status_service';
import {
  InternalStatusServiceSetup,
  StatusServiceSetup,
  ServiceStatusLevels,
  ServiceStatus,
  CoreStatus,
} from './types';
import { BehaviorSubject } from 'rxjs';

const available: ServiceStatus = {
  level: ServiceStatusLevels.available,
  summary: 'Service is working',
};
const availableCoreStatus: CoreStatus = {
  opensearch: available,
  savedObjects: available,
};

const createSetupContractMock = () => {
  const setupContract: jest.Mocked<StatusServiceSetup> = {
    core$: new BehaviorSubject(availableCoreStatus),
    overall$: new BehaviorSubject(available),
    set: jest.fn(),
    dependencies$: new BehaviorSubject({}),
    derivedStatus$: new BehaviorSubject(available),
    isStatusPageAnonymous: jest.fn().mockReturnValue(false),
  };

  return setupContract;
};

const createInternalSetupContractMock = () => {
  const setupContract: jest.Mocked<InternalStatusServiceSetup> = {
    core$: new BehaviorSubject(availableCoreStatus),
    overall$: new BehaviorSubject(available),
    isStatusPageAnonymous: jest.fn().mockReturnValue(false),
    plugins: {
      set: jest.fn(),
      getDependenciesStatus$: jest.fn(),
      getDerivedStatus$: jest.fn(),
    },
  };

  return setupContract;
};

type StatusServiceContract = PublicMethodsOf<StatusService>;

const createMock = () => {
  const mocked: jest.Mocked<StatusServiceContract> = {
    setup: jest.fn().mockReturnValue(createInternalSetupContractMock()),
    start: jest.fn(),
    stop: jest.fn(),
  };
  return mocked;
};

export const statusServiceMock = {
  create: createMock,
  createSetupContract: createSetupContractMock,
  createInternalSetupContract: createInternalSetupContractMock,
};
