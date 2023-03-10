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

import { CoreSetup, RequestHandlerContext } from 'src/core/server';
import { coreMock, httpServerMock } from '../../../../../src/core/server/mocks';
import { registerPreviewScriptedFieldRoute } from './preview_scripted_field';

describe('preview_scripted_field route', () => {
  let mockCoreSetup: MockedKeys<CoreSetup>;

  beforeEach(() => {
    mockCoreSetup = coreMock.createSetup();
  });

  it('handler calls /_search with the given request', async () => {
    const response = { body: { responses: [{ hits: { _id: 'hi' } }] } };
    const mockClient = { search: jest.fn().mockResolvedValue(response) };
    const mockContext = {
      core: {
        opensearch: { client: { asCurrentUser: mockClient } },
      },
    };
    const mockBody = {
      index: 'opensearch_dashboards_sample_data_logs',
      name: 'my_scripted_field',
      script: `doc['foo'].value`,
    };
    const mockQuery = {};
    const mockRequest = httpServerMock.createOpenSearchDashboardsRequest({
      body: mockBody,
      query: mockQuery,
    });
    const mockResponse = httpServerMock.createResponseFactory();

    registerPreviewScriptedFieldRoute(mockCoreSetup.http.createRouter());

    const mockRouter = mockCoreSetup.http.createRouter.mock.results[0].value;
    const handler = mockRouter.post.mock.calls[0][1];
    await handler((mockContext as unknown) as RequestHandlerContext, mockRequest, mockResponse);

    expect(mockClient.search.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "_source": undefined,
        "body": Object {
          "query": Object {
            "match_all": Object {},
          },
          "script_fields": Object {
            "my_scripted_field": Object {
              "script": Object {
                "lang": "painless",
                "source": "doc['foo'].value",
              },
            },
          },
        },
        "index": "opensearch_dashboards_sample_data_logs",
        "size": 10,
        "timeout": "30s",
      }
    `);

    expect(mockResponse.ok).toBeCalled();
    expect(mockResponse.ok.mock.calls[0][0]).toEqual({ body: response });
  });

  it('uses optional parameters when they are provided', async () => {
    const response = { body: { responses: [{ hits: { _id: 'hi' } }] } };
    const mockClient = { search: jest.fn().mockResolvedValue(response) };
    const mockContext = {
      core: {
        opensearch: { client: { asCurrentUser: mockClient } },
      },
    };
    const mockBody = {
      index: 'opensearch_dashboards_sample_data_logs',
      name: 'my_scripted_field',
      script: `doc['foo'].value`,
      query: {
        bool: { some: 'query' },
      },
      additionalFields: ['a', 'b', 'c'],
    };
    const mockQuery = {};
    const mockRequest = httpServerMock.createOpenSearchDashboardsRequest({
      body: mockBody,
      query: mockQuery,
    });
    const mockResponse = httpServerMock.createResponseFactory();

    registerPreviewScriptedFieldRoute(mockCoreSetup.http.createRouter());

    const mockRouter = mockCoreSetup.http.createRouter.mock.results[0].value;
    const handler = mockRouter.post.mock.calls[0][1];
    await handler((mockContext as unknown) as RequestHandlerContext, mockRequest, mockResponse);

    expect(mockClient.search.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "_source": Array [
          "a",
          "b",
          "c",
        ],
        "body": Object {
          "query": Object {
            "bool": Object {
              "some": "query",
            },
          },
          "script_fields": Object {
            "my_scripted_field": Object {
              "script": Object {
                "lang": "painless",
                "source": "doc['foo'].value",
              },
            },
          },
        },
        "index": "opensearch_dashboards_sample_data_logs",
        "size": 10,
        "timeout": "30s",
      }
    `);
  });

  it('handler throws an error if the search throws an error', async () => {
    const response = {
      statusCode: 400,
      message: 'oops',
    };
    const mockClient = { search: jest.fn().mockReturnValue(Promise.reject(response)) };
    const mockContext = {
      core: {
        opensearch: { client: { asCurrentUser: mockClient } },
      },
    };
    const mockBody = { searches: [{ header: {}, body: {} }] };
    const mockQuery = {};
    const mockRequest = httpServerMock.createOpenSearchDashboardsRequest({
      body: mockBody,
      query: mockQuery,
    });
    const mockResponse = httpServerMock.createResponseFactory();

    registerPreviewScriptedFieldRoute(mockCoreSetup.http.createRouter());

    const mockRouter = mockCoreSetup.http.createRouter.mock.results[0].value;
    const handler = mockRouter.post.mock.calls[0][1];
    await handler((mockContext as unknown) as RequestHandlerContext, mockRequest, mockResponse);

    expect(mockClient.search).toBeCalled();
    expect(mockResponse.customError).toBeCalled();

    const error: any = mockResponse.customError.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.body).toMatchInlineSnapshot(`
      Object {
        "attributes": Object {
          "error": "oops",
        },
        "message": "oops",
      }
    `);
  });
});
