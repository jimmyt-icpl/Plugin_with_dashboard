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

import { CoreRouteHandlerContext } from './core_route_handler_context';
import { coreMock, httpServerMock } from './mocks';

describe('#auditor', () => {
  test('returns the results of coreStart.audiTrail.asScoped', () => {
    const request = httpServerMock.createOpenSearchDashboardsRequest();
    const coreStart = coreMock.createInternalStart();
    const context = new CoreRouteHandlerContext(coreStart, request);

    const auditor = context.auditor;
    expect(auditor).toBe(coreStart.auditTrail.asScoped.mock.results[0].value);
  });

  test('lazily created', () => {
    const request = httpServerMock.createOpenSearchDashboardsRequest();
    const coreStart = coreMock.createInternalStart();
    const context = new CoreRouteHandlerContext(coreStart, request);

    expect(coreStart.auditTrail.asScoped).not.toHaveBeenCalled();
    const auditor = context.auditor;
    expect(coreStart.auditTrail.asScoped).toHaveBeenCalled();
    expect(auditor).toBeDefined();
  });

  test('only creates one instance', () => {
    const request = httpServerMock.createOpenSearchDashboardsRequest();
    const coreStart = coreMock.createInternalStart();
    const context = new CoreRouteHandlerContext(coreStart, request);

    const auditor1 = context.auditor;
    const auditor2 = context.auditor;
    expect(coreStart.auditTrail.asScoped.mock.calls.length).toBe(1);
    const mockResult = coreStart.auditTrail.asScoped.mock.results[0].value;
    expect(auditor1).toBe(mockResult);
    expect(auditor2).toBe(mockResult);
  });
});

describe('#opensearch', () => {
  describe('#client', () => {
    test('returns the results of coreStart.opensearch.client.asScoped', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const client = context.opensearch.client;
      expect(client).toBe(coreStart.opensearch.client.asScoped.mock.results[0].value);
    });

    test('lazily created', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      expect(coreStart.opensearch.client.asScoped).not.toHaveBeenCalled();
      const client = context.opensearch.client;
      expect(coreStart.opensearch.client.asScoped).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    test('only creates one instance', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const client1 = context.opensearch.client;
      const client2 = context.opensearch.client;
      expect(coreStart.opensearch.client.asScoped.mock.calls.length).toBe(1);
      const mockResult = coreStart.opensearch.client.asScoped.mock.results[0].value;
      expect(client1).toBe(mockResult);
      expect(client2).toBe(mockResult);
    });
  });

  describe('#legacy', () => {
    describe('#client', () => {
      test('returns the results of coreStart.opensearch.legacy.client.asScoped', () => {
        const request = httpServerMock.createOpenSearchDashboardsRequest();
        const coreStart = coreMock.createInternalStart();
        const context = new CoreRouteHandlerContext(coreStart, request);

        const client = context.opensearch.legacy.client;
        expect(client).toBe(coreStart.opensearch.legacy.client.asScoped.mock.results[0].value);
      });

      test('lazily created', () => {
        const request = httpServerMock.createOpenSearchDashboardsRequest();
        const coreStart = coreMock.createInternalStart();
        const context = new CoreRouteHandlerContext(coreStart, request);

        expect(coreStart.opensearch.legacy.client.asScoped).not.toHaveBeenCalled();
        const client = context.opensearch.legacy.client;
        expect(coreStart.opensearch.legacy.client.asScoped).toHaveBeenCalled();
        expect(client).toBeDefined();
      });

      test('only creates one instance', () => {
        const request = httpServerMock.createOpenSearchDashboardsRequest();
        const coreStart = coreMock.createInternalStart();
        const context = new CoreRouteHandlerContext(coreStart, request);

        const client1 = context.opensearch.legacy.client;
        const client2 = context.opensearch.legacy.client;
        expect(coreStart.opensearch.legacy.client.asScoped.mock.calls.length).toBe(1);
        const mockResult = coreStart.opensearch.legacy.client.asScoped.mock.results[0].value;
        expect(client1).toBe(mockResult);
        expect(client2).toBe(mockResult);
      });
    });
  });
});

describe('#savedObjects', () => {
  describe('#client', () => {
    test('returns the results of coreStart.savedObjects.getScopedClient', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const client = context.savedObjects.client;
      expect(client).toBe(coreStart.savedObjects.getScopedClient.mock.results[0].value);
    });

    test('lazily created', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const savedObjects = context.savedObjects;
      expect(coreStart.savedObjects.getScopedClient).not.toHaveBeenCalled();
      const client = savedObjects.client;
      expect(coreStart.savedObjects.getScopedClient).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    test('only creates one instance', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const client1 = context.savedObjects.client;
      const client2 = context.savedObjects.client;
      expect(coreStart.savedObjects.getScopedClient.mock.calls.length).toBe(1);
      const mockResult = coreStart.savedObjects.getScopedClient.mock.results[0].value;
      expect(client1).toBe(mockResult);
      expect(client2).toBe(mockResult);
    });
  });

  describe('#typeRegistry', () => {
    test('returns the results of coreStart.savedObjects.getTypeRegistry', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const typeRegistry = context.savedObjects.typeRegistry;
      expect(typeRegistry).toBe(coreStart.savedObjects.getTypeRegistry.mock.results[0].value);
    });

    test('lazily created', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      expect(coreStart.savedObjects.getTypeRegistry).not.toHaveBeenCalled();
      const typeRegistry = context.savedObjects.typeRegistry;
      expect(coreStart.savedObjects.getTypeRegistry).toHaveBeenCalled();
      expect(typeRegistry).toBeDefined();
    });

    test('only creates one instance', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const typeRegistry1 = context.savedObjects.typeRegistry;
      const typeRegistry2 = context.savedObjects.typeRegistry;
      expect(coreStart.savedObjects.getTypeRegistry.mock.calls.length).toBe(1);
      const mockResult = coreStart.savedObjects.getTypeRegistry.mock.results[0].value;
      expect(typeRegistry1).toBe(mockResult);
      expect(typeRegistry2).toBe(mockResult);
    });
  });
});

describe('#uiSettings', () => {
  describe('#client', () => {
    test('returns the results of coreStart.uiSettings.asScopedToClient', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const client = context.uiSettings.client;
      expect(client).toBe(coreStart.uiSettings.asScopedToClient.mock.results[0].value);
    });

    test('lazily created', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      expect(coreStart.uiSettings.asScopedToClient).not.toHaveBeenCalled();
      const client = context.uiSettings.client;
      expect(coreStart.uiSettings.asScopedToClient).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    test('only creates one instance', () => {
      const request = httpServerMock.createOpenSearchDashboardsRequest();
      const coreStart = coreMock.createInternalStart();
      const context = new CoreRouteHandlerContext(coreStart, request);

      const client1 = context.uiSettings.client;
      const client2 = context.uiSettings.client;
      expect(coreStart.uiSettings.asScopedToClient.mock.calls.length).toBe(1);
      const mockResult = coreStart.uiSettings.asScopedToClient.mock.results[0].value;
      expect(client1).toBe(mockResult);
      expect(client2).toBe(mockResult);
    });
  });
});
