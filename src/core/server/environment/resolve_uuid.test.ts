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

import { join } from 'path';
import { PathConfigType } from '@osd/utils';
import { loggingSystemMock } from '../logging/logging_system.mock';
import { readFile, writeFile } from './fs';
import { resolveInstanceUuid, UUID_7_6_0_BUG } from './resolve_uuid';
import { HttpConfigType } from '../http';

jest.mock('uuid', () => ({
  v4: () => 'NEW_UUID',
}));

jest.mock('./fs', () => ({
  readFile: jest.fn(() => Promise.resolve('')),
  writeFile: jest.fn(() => Promise.resolve('')),
}));

const DEFAULT_FILE_UUID = 'FILE_UUID';
const DEFAULT_CONFIG_UUID = 'CONFIG_UUID';
const fileNotFoundError = { code: 'ENOENT' };
const permissionError = { code: 'EACCES' };
const isDirectoryError = { code: 'EISDIR' };

const mockReadFile = ({
  uuid = DEFAULT_FILE_UUID,
  error = null,
}: Partial<{
  uuid: string;
  error: any;
}>) => {
  ((readFile as unknown) as jest.Mock).mockImplementation(() => {
    if (error) {
      return Promise.reject(error);
    } else {
      return Promise.resolve(uuid);
    }
  });
};

const mockWriteFile = (error?: object) => {
  ((writeFile as unknown) as jest.Mock).mockImplementation(() => {
    if (error) {
      return Promise.reject(error);
    } else {
      return Promise.resolve();
    }
  });
};

const createServerConfig = (serverUuid: string | undefined) => {
  return {
    uuid: serverUuid,
  } as HttpConfigType;
};

describe('resolveInstanceUuid', () => {
  let logger: ReturnType<typeof loggingSystemMock.createLogger>;
  let pathConfig: PathConfigType;
  let serverConfig: HttpConfigType;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReadFile({ uuid: DEFAULT_FILE_UUID });
    mockWriteFile();

    pathConfig = {
      data: 'data-folder',
    };
    serverConfig = createServerConfig(DEFAULT_CONFIG_UUID);

    logger = loggingSystemMock.createLogger();
  });

  describe('when file is present and config property is set', () => {
    describe('when they mismatch', () => {
      it('writes to file and returns the config uuid', async () => {
        const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
        expect(uuid).toEqual(DEFAULT_CONFIG_UUID);
        expect(writeFile).toHaveBeenCalledWith(
          join('data-folder', 'uuid'),
          DEFAULT_CONFIG_UUID,
          expect.any(Object)
        );
        expect(logger.debug).toHaveBeenCalledTimes(1);
        expect(logger.debug.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "Updating OpenSearch Dashboards instance UUID to: CONFIG_UUID (was: FILE_UUID)",
          ]
        `);
      });
    });

    describe('when they match', () => {
      it('does not write to file', async () => {
        mockReadFile({ uuid: DEFAULT_CONFIG_UUID });
        const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
        expect(uuid).toEqual(DEFAULT_CONFIG_UUID);
        expect(writeFile).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledTimes(1);
        expect(logger.debug.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "OpenSearch Dashboards instance UUID: CONFIG_UUID",
          ]
        `);
      });
    });
  });

  describe('when file is not present and config property is set', () => {
    it('writes the uuid to file and returns the config uuid', async () => {
      mockReadFile({ error: fileNotFoundError });
      const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
      expect(uuid).toEqual(DEFAULT_CONFIG_UUID);
      expect(writeFile).toHaveBeenCalledWith(
        join('data-folder', 'uuid'),
        DEFAULT_CONFIG_UUID,
        expect.any(Object)
      );
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.debug.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "Setting new OpenSearch Dashboards instance UUID: CONFIG_UUID",
        ]
      `);
    });
  });

  describe('when file is present and config property is not set', () => {
    it('does not write to file and returns the file uuid', async () => {
      serverConfig = createServerConfig(undefined);
      const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
      expect(uuid).toEqual(DEFAULT_FILE_UUID);
      expect(writeFile).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.debug.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "Resuming persistent OpenSearch Dashboards instance UUID: FILE_UUID",
        ]
      `);
    });
  });

  describe('when file is present with 7.6.0 UUID', () => {
    describe('when config property is not set', () => {
      it('writes new uuid to file and returns new uuid', async () => {
        mockReadFile({ uuid: UUID_7_6_0_BUG });
        serverConfig = createServerConfig(undefined);
        const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
        expect(uuid).not.toEqual(UUID_7_6_0_BUG);
        expect(uuid).toEqual('NEW_UUID');
        expect(writeFile).toHaveBeenCalledWith(
          join('data-folder', 'uuid'),
          'NEW_UUID',
          expect.any(Object)
        );
        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug.mock.calls).toMatchInlineSnapshot(`
          Array [
            Array [
              "UUID from 7.6.0 bug detected, ignoring file UUID",
            ],
            Array [
              "Setting new OpenSearch Dashboards instance UUID: NEW_UUID",
            ],
          ]
        `);
      });
    });

    describe('when config property is set', () => {
      it('writes config uuid to file and returns config uuid', async () => {
        mockReadFile({ uuid: UUID_7_6_0_BUG });
        serverConfig = createServerConfig(DEFAULT_CONFIG_UUID);
        const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
        expect(uuid).not.toEqual(UUID_7_6_0_BUG);
        expect(uuid).toEqual(DEFAULT_CONFIG_UUID);
        expect(writeFile).toHaveBeenCalledWith(
          join('data-folder', 'uuid'),
          DEFAULT_CONFIG_UUID,
          expect.any(Object)
        );
        expect(logger.debug).toHaveBeenCalledTimes(2);
        expect(logger.debug.mock.calls).toMatchInlineSnapshot(`
          Array [
            Array [
              "UUID from 7.6.0 bug detected, ignoring file UUID",
            ],
            Array [
              "Setting new OpenSearch Dashboards instance UUID: CONFIG_UUID",
            ],
          ]
        `);
      });
    });
  });

  describe('when file is not present and config property is not set', () => {
    it('generates a new uuid and write it to file', async () => {
      serverConfig = createServerConfig(undefined);
      mockReadFile({ error: fileNotFoundError });
      const uuid = await resolveInstanceUuid({ pathConfig, serverConfig, logger });
      expect(uuid).toEqual('NEW_UUID');
      expect(writeFile).toHaveBeenCalledWith(
        join('data-folder', 'uuid'),
        'NEW_UUID',
        expect.any(Object)
      );
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.debug.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "Setting new OpenSearch Dashboards instance UUID: NEW_UUID",
        ]
      `);
    });
  });

  describe('when file access error occurs', () => {
    it('throws an explicit error for file read errors', async () => {
      mockReadFile({ error: permissionError });
      await expect(
        resolveInstanceUuid({ pathConfig, serverConfig, logger })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Unable to read OpenSearch Dashboards UUID file, please check the uuid.server configuration value in opensearch_dashboards.yml and ensure OpenSearch Dashboards has sufficient permissions to read / write to this file. Error was: EACCES"`
      );
    });
    it('throws an explicit error for file write errors', async () => {
      mockWriteFile(isDirectoryError);
      await expect(
        resolveInstanceUuid({ pathConfig, serverConfig, logger })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Unable to write OpenSearch Dashboards UUID file, please check the uuid.server configuration value in opensearch_dashboards.yml and ensure OpenSearch Dashboards has sufficient permissions to read / write to this file. Error was: EISDIR"`
      );
    });
  });
});
