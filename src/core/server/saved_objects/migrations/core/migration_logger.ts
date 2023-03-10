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

import { Logger, LogMeta } from '../../../logging';

/*
 * This file provides a helper class for ensuring that all logging
 * in the migration system is done in a fairly uniform way.
 */

export type LogFn = (path: string[], message: string) => void;

/** @public */
export interface SavedObjectsMigrationLogger {
  debug: (msg: string) => void;
  info: (msg: string) => void;
  /**
   * @deprecated Use `warn` instead.
   */
  warning: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string, meta: LogMeta) => void;
}

export class MigrationLogger implements SavedObjectsMigrationLogger {
  private logger: Logger;

  constructor(log: Logger) {
    this.logger = log;
  }

  public info = (msg: string) => this.logger.info(msg);
  public debug = (msg: string) => this.logger.debug(msg);
  public warning = (msg: string) => this.logger.warn(msg);
  public warn = (msg: string) => this.logger.warn(msg);
  public error = (msg: string, meta: LogMeta) => this.logger.error(msg, meta);
}
