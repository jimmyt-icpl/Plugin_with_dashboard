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

import { IRequestConfig } from 'angular';

const SYSTEM_REQUEST_HEADER_NAME = 'osd-system-request';
const LEGACY_SYSTEM_API_HEADER_NAME = 'osd-system-api';

/**
 * Adds a custom header designating request as system API
 * @param originalHeaders Object representing set of headers
 * @return Object representing set of headers, with system API header added in
 */
export function addSystemApiHeader(originalHeaders: Record<string, string>) {
  const systemApiHeaders = {
    [SYSTEM_REQUEST_HEADER_NAME]: true,
  };
  return {
    ...originalHeaders,
    ...systemApiHeaders,
  };
}

/**
 * Returns true if request is a system API request; false otherwise
 *
 * @param request Object Request object created by $http service
 * @return true if request is a system API request; false otherwise
 */
export function isSystemApiRequest(request: IRequestConfig) {
  const { headers } = request;
  return (
    headers && (!!headers[SYSTEM_REQUEST_HEADER_NAME] || !!headers[LEGACY_SYSTEM_API_HEADER_NAME])
  );
}
