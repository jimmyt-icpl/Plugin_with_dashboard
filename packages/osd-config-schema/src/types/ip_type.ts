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

import typeDetect from 'type-detect';
import { internals } from '../internals';
import { Type, TypeOptions } from './type';

export type IpVersion = 'ipv4' | 'ipv6';
export type IpOptions = TypeOptions<string> & {
  /**
   * IP versions to accept, defaults to ['ipv4', 'ipv6'].
   */
  versions: IpVersion[];
};

export class IpType extends Type<string> {
  constructor(options: IpOptions = { versions: ['ipv4', 'ipv6'] }) {
    const schema = internals.string().ip({ version: options.versions, cidr: 'forbidden' });
    super(schema, options);
  }

  protected handleError(type: string, { value, version }: Record<string, any>) {
    switch (type) {
      case 'string.base':
        return `expected value of type [string] but got [${typeDetect(value)}]`;
      case 'string.ipVersion':
        return `value must be a valid ${version.join(' or ')} address`;
    }
  }
}
