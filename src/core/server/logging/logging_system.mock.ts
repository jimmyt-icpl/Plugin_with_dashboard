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

// Test helpers to simplify mocking logs and collecting all their outputs
import { LoggerFactory } from '@osd/logging';
import { ILoggingSystem } from './logging_system';
import { loggerMock, MockedLogger } from './logger.mock';

const createLoggingSystemMock = () => {
  const mockLog = loggerMock.create();

  mockLog.get.mockImplementation((...context) => ({
    ...mockLog,
    context,
  }));

  const mocked: jest.Mocked<ILoggingSystem> = {
    get: jest.fn(),
    asLoggerFactory: jest.fn(),
    setContextConfig: jest.fn(),
    upgrade: jest.fn(),
    stop: jest.fn(),
  };
  mocked.get.mockImplementation((...context) => ({
    ...mockLog,
    context,
  }));
  mocked.asLoggerFactory.mockImplementation(() => mocked);
  mocked.stop.mockResolvedValue();
  return mocked;
};

const collectLoggingSystemMock = (loggerFactory: LoggerFactory) => {
  const mockLog = loggerFactory.get() as MockedLogger;
  return loggerMock.collect(mockLog);
};

const clearLoggingSystemMock = (loggerFactory: LoggerFactory) => {
  const mockedLoggerFactory = (loggerFactory as unknown) as jest.Mocked<ILoggingSystem>;
  mockedLoggerFactory.get.mockClear();
  mockedLoggerFactory.asLoggerFactory.mockClear();
  mockedLoggerFactory.upgrade.mockClear();
  mockedLoggerFactory.stop.mockClear();

  const mockLog = loggerFactory.get() as MockedLogger;
  loggerMock.clear(mockLog);
};

export const loggingSystemMock = {
  create: createLoggingSystemMock,
  collect: collectLoggingSystemMock,
  clear: clearLoggingSystemMock,
  createLogger: loggerMock.create,
};
