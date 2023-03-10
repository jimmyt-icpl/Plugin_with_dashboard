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

import uuid from 'uuid';
import { join } from 'path';
import { PathConfigType } from '@osd/utils';
import { readFile, writeFile } from './fs';
import { HttpConfigType } from '../http';
import { Logger } from '../logging';

const FILE_ENCODING = 'utf8';
const FILE_NAME = 'uuid';
/**
 * This UUID was inadvertantly shipped in the 7.6.0 distributable and should be deleted if found.
 * See https://github.com/elastic/kibana/issues/57673 for more info.
 */
export const UUID_7_6_0_BUG = `ce42b997-a913-4d58-be46-bb1937feedd6`;

export async function resolveInstanceUuid({
  pathConfig,
  serverConfig,
  logger,
}: {
  pathConfig: PathConfigType;
  serverConfig: HttpConfigType;
  logger: Logger;
}): Promise<string> {
  const uuidFilePath = join(pathConfig.data, FILE_NAME);
  const uuidFromFile = await readUuidFromFile(uuidFilePath, logger);
  const uuidFromConfig = serverConfig.uuid;

  if (uuidFromConfig) {
    if (uuidFromConfig === uuidFromFile) {
      // uuid matches, nothing to do
      logger.debug(`OpenSearch Dashboards instance UUID: ${uuidFromConfig}`);
      return uuidFromConfig;
    } else {
      // uuid in file don't match, or file was not present, we need to write it.
      if (uuidFromFile === undefined) {
        logger.debug(`Setting new OpenSearch Dashboards instance UUID: ${uuidFromConfig}`);
      } else {
        logger.debug(
          `Updating OpenSearch Dashboards instance UUID to: ${uuidFromConfig} (was: ${uuidFromFile})`
        );
      }
      await writeUuidToFile(uuidFilePath, uuidFromConfig);
      return uuidFromConfig;
    }
  }
  if (uuidFromFile === undefined) {
    const newUuid = uuid.v4();
    // no uuid either in config or file, we need to generate and write it.
    logger.debug(`Setting new OpenSearch Dashboards instance UUID: ${newUuid}`);
    await writeUuidToFile(uuidFilePath, newUuid);
    return newUuid;
  }

  logger.debug(`Resuming persistent OpenSearch Dashboards instance UUID: ${uuidFromFile}`);
  return uuidFromFile;
}

async function readUuidFromFile(filepath: string, logger: Logger): Promise<string | undefined> {
  try {
    const content = await readFile(filepath);
    const decoded = content.toString(FILE_ENCODING);

    if (decoded === UUID_7_6_0_BUG) {
      logger.debug(`UUID from 7.6.0 bug detected, ignoring file UUID`);
      return undefined;
    } else {
      return decoded;
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      // non-existent uuid file is ok, we will create it.
      return undefined;
    }
    throw new Error(
      'Unable to read OpenSearch Dashboards UUID file, please check the uuid.server configuration ' +
        'value in opensearch_dashboards.yml and ensure OpenSearch Dashboards has sufficient permissions to read / write to this file. ' +
        `Error was: ${e.code}`
    );
  }
}

async function writeUuidToFile(filepath: string, uuidValue: string) {
  try {
    return await writeFile(filepath, uuidValue, { encoding: FILE_ENCODING });
  } catch (e) {
    throw new Error(
      'Unable to write OpenSearch Dashboards UUID file, please check the uuid.server configuration ' +
        'value in opensearch_dashboards.yml and ensure OpenSearch Dashboards has sufficient permissions to read / write to this file. ' +
        `Error was: ${e.code}`
    );
  }
}
