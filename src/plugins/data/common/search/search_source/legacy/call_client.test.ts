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

import { callClient } from './call_client';
import { SearchStrategySearchParams } from './types';
import { defaultSearchStrategy } from './default_search_strategy';
import { FetchHandlers } from '../fetch';
import { BehaviorSubject } from 'rxjs';

const mockAbortFn = jest.fn();

jest.mock('./default_search_strategy', () => {
  return {
    defaultSearchStrategy: {
      search: jest.fn(({ searchRequests }: SearchStrategySearchParams) => {
        return {
          searching: Promise.resolve(
            searchRequests.map((req) => {
              return {
                id: req._searchStrategyId,
              };
            })
          ),
          abort: mockAbortFn,
        };
      }),
    },
  };
});

describe('callClient', () => {
  const handleResponse = jest.fn().mockImplementation((req, res) => res);
  const handlers = {
    getConfig: jest.fn(),
    onResponse: handleResponse,
    legacy: {
      callMsearch: jest.fn(),
      loadingCount$: new BehaviorSubject(0),
    },
  } as FetchHandlers;

  beforeEach(() => {
    handleResponse.mockClear();
  });

  test('Passes the additional arguments it is given to the search strategy', () => {
    const searchRequests = [{ _searchStrategyId: 0 }];

    callClient(searchRequests, [], handlers);

    expect(defaultSearchStrategy.search).toBeCalled();
    expect((defaultSearchStrategy.search as any).mock.calls[0][0]).toEqual({
      searchRequests,
      ...handlers,
    });
  });

  test('Returns the responses in the original order', async () => {
    const searchRequests = [{ _searchStrategyId: 1 }, { _searchStrategyId: 0 }];

    const responses = await Promise.all(callClient(searchRequests, [], handlers));

    expect(responses[0]).toEqual({ id: searchRequests[0]._searchStrategyId });
    expect(responses[1]).toEqual({ id: searchRequests[1]._searchStrategyId });
  });

  test('Calls handleResponse with each request and response', async () => {
    const searchRequests = [{ _searchStrategyId: 0 }, { _searchStrategyId: 1 }];

    const responses = callClient(searchRequests, [], handlers);
    await Promise.all(responses);

    expect(handleResponse).toBeCalledTimes(2);
    expect(handleResponse).toBeCalledWith(searchRequests[0], {
      id: searchRequests[0]._searchStrategyId,
    });
    expect(handleResponse).toBeCalledWith(searchRequests[1], {
      id: searchRequests[1]._searchStrategyId,
    });
  });

  test('If passed an abortSignal, calls abort on the strategy if the signal is aborted', () => {
    const searchRequests = [{ _searchStrategyId: 0 }, { _searchStrategyId: 1 }];
    const abortController = new AbortController();
    const requestOptions = [
      {
        abortSignal: abortController.signal,
      },
    ];

    callClient(searchRequests, requestOptions, handlers);
    abortController.abort();

    expect(mockAbortFn).toBeCalled();
    // expect(mockAbortFns[1]).not.toBeCalled();
  });
});
