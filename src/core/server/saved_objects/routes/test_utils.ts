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

import { ContextService } from '../../context';
import { createHttpServer, createCoreContext } from '../../http/test_utils';
import { coreMock } from '../../mocks';
import { SavedObjectsType } from '../types';

const defaultCoreId = Symbol('core');

export const setupServer = async (coreId: symbol = defaultCoreId) => {
  const coreContext = createCoreContext({ coreId });
  const contextService = new ContextService(coreContext);

  const server = createHttpServer(coreContext);
  const httpSetup = await server.setup({
    context: contextService.setup({ pluginDependencies: new Map() }),
  });
  const handlerContext = coreMock.createRequestHandlerContext();

  httpSetup.registerRouteHandlerContext(coreId, 'core', async (ctx, req, res) => {
    return handlerContext;
  });

  return {
    server,
    httpSetup,
    handlerContext,
  };
};

export const createExportableType = (name: string): SavedObjectsType => {
  return {
    name,
    hidden: false,
    namespaceType: 'single',
    mappings: {
      properties: {},
    },
    management: {
      importableAndExportable: true,
    },
  };
};
