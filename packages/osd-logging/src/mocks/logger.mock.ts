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

import { Logger } from '../logger';

export type MockedLogger = jest.Mocked<Logger> & { context: string[] };

const createLoggerMock = (context: string[] = []) => {
  const mockLog: MockedLogger = {
    context,
    debug: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    get: jest.fn(),
  };
  mockLog.get.mockImplementation((...ctx) => ({
    ctx,
    ...mockLog,
  }));

  return mockLog;
};

const clearLoggerMock = (logger: MockedLogger) => {
  logger.debug.mockClear();
  logger.info.mockClear();
  logger.warn.mockClear();
  logger.error.mockClear();
  logger.trace.mockClear();
  logger.fatal.mockClear();
  logger.log.mockClear();
};

const collectLoggerMock = (logger: MockedLogger) => {
  return {
    debug: logger.debug.mock.calls,
    error: logger.error.mock.calls,
    fatal: logger.fatal.mock.calls,
    info: logger.info.mock.calls,
    log: logger.log.mock.calls,
    trace: logger.trace.mock.calls,
    warn: logger.warn.mock.calls,
  };
};

export const loggerMock = {
  create: createLoggerMock,
  clear: clearLoggerMock,
  collect: collectLoggerMock,
};
