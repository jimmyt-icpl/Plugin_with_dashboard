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

import { Logger, LegacyAPICaller, OpenSearchClient } from 'opensearch-dashboards/server';

export type CollectorFormatForBulkUpload<T, U> = (result: T) => { type: string; payload: U };

export type AllowedSchemaTypes =
  | 'keyword'
  | 'text'
  | 'number'
  | 'boolean'
  | 'long'
  | 'date'
  | 'float';

export interface SchemaField {
  type: string;
}

export type RecursiveMakeSchemaFrom<U> = U extends object
  ? MakeSchemaFrom<U>
  : { type: AllowedSchemaTypes };

// Using Required to enforce all optional keys in the object
export type MakeSchemaFrom<Base> = {
  [Key in keyof Required<Base>]: Required<Base>[Key] extends Array<infer U>
    ? { type: 'array'; items: RecursiveMakeSchemaFrom<U> }
    : RecursiveMakeSchemaFrom<Required<Base>[Key]>;
};

export interface CollectorOptions<T = unknown, U = T> {
  type: string;
  init?: Function;
  schema?: MakeSchemaFrom<T>;
  fetch: (callCluster: LegacyAPICaller, opensearchClient?: OpenSearchClient) => Promise<T> | T;
  /*
   * A hook for allowing the fetched data payload to be organized into a typed
   * data model for internal bulk upload. See defaultFormatterForBulkUpload for
   * a generic example.
   */
  formatForBulkUpload?: CollectorFormatForBulkUpload<T, U>;
  isReady: () => Promise<boolean> | boolean;
}

export class Collector<T = unknown, U = T> {
  public readonly type: CollectorOptions<T, U>['type'];
  public readonly init?: CollectorOptions<T, U>['init'];
  public readonly fetch: CollectorOptions<T, U>['fetch'];
  private readonly _formatForBulkUpload?: CollectorFormatForBulkUpload<T, U>;
  public readonly isReady: CollectorOptions<T, U>['isReady'];
  /*
   * @param {Object} logger - logger object
   * @param {String} options.type - property name as the key for the data
   * @param {Function} options.init (optional) - initialization function
   * @param {Function} options.fetch - function to query data
   * @param {Function} options.formatForBulkUpload - optional
   * @param {Function} options.rest - optional other properties
   */
  constructor(
    protected readonly log: Logger,
    { type, init, fetch, formatForBulkUpload, isReady, ...options }: CollectorOptions<T, U>
  ) {
    if (type === undefined) {
      throw new Error('Collector must be instantiated with a options.type string property');
    }
    if (typeof init !== 'undefined' && typeof init !== 'function') {
      throw new Error(
        'If init property is passed, Collector must be instantiated with a options.init as a function property'
      );
    }
    if (typeof fetch !== 'function') {
      throw new Error('Collector must be instantiated with a options.fetch function property');
    }

    Object.assign(this, options); // spread in other properties and mutate "this"

    this.type = type;
    this.init = init;
    this.fetch = fetch;
    this.isReady = typeof isReady === 'function' ? isReady : () => true;
    this._formatForBulkUpload = formatForBulkUpload;
  }

  public formatForBulkUpload(result: T) {
    if (this._formatForBulkUpload) {
      return this._formatForBulkUpload(result);
    } else {
      return this.defaultFormatterForBulkUpload(result);
    }
  }

  protected defaultFormatterForBulkUpload(result: T) {
    return {
      type: this.type,
      payload: (result as unknown) as U,
    };
  }
}
