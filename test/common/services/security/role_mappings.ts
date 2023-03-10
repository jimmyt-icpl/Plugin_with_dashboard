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

import util from 'util';
import { OsdClient, ToolingLog } from '@osd/dev-utils';

export class RoleMappings {
  constructor(private log: ToolingLog, private osdClient: OsdClient) {}

  public async getAll() {
    this.log.debug(`Getting role mappings`);
    const { data, status, statusText } = await this.osdClient.request<Array<{ name: string }>>({
      path: `/internal/security/role_mapping`,
      method: 'GET',
    });
    if (status !== 200) {
      throw new Error(
        `Expected status code of 200, received ${status} ${statusText}: ${util.inspect(data)}`
      );
    }
    return data;
  }

  public async create(name: string, roleMapping: Record<string, any>) {
    this.log.debug(`creating role mapping ${name}`);
    const { data, status, statusText } = await this.osdClient.request({
      path: `/internal/security/role_mapping/${encodeURIComponent(name)}`,
      method: 'POST',
      body: roleMapping,
    });
    if (status !== 200) {
      throw new Error(
        `Expected status code of 200, received ${status} ${statusText}: ${util.inspect(data)}`
      );
    }
    this.log.debug(`created role mapping ${name}`);
  }

  public async delete(name: string) {
    this.log.debug(`deleting role mapping ${name}`);
    const { data, status, statusText } = await this.osdClient.request({
      path: `/internal/security/role_mapping/${encodeURIComponent(name)}`,
      method: 'DELETE',
    });
    if (status !== 200 && status !== 404) {
      throw new Error(
        `Expected status code of 200 or 404, received ${status} ${statusText}: ${util.inspect(
          data
        )}`
      );
    }
    this.log.debug(`deleted role mapping ${name}`);
  }
}
