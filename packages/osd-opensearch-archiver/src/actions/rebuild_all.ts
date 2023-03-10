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

import { resolve, dirname, relative } from 'path';
import { stat, Stats, rename, createReadStream, createWriteStream } from 'fs';
import { Readable, Writable } from 'stream';
import { fromNode } from 'bluebird';
import { ToolingLog } from '@osd/dev-utils';

import { createPromiseFromStreams } from '../lib/streams';
import {
  prioritizeMappings,
  readDirectory,
  isGzip,
  createParseArchiveStreams,
  createFormatArchiveStreams,
} from '../lib';

async function isDirectory(path: string): Promise<boolean> {
  const stats: Stats = await fromNode((cb) => stat(path, cb));
  return stats.isDirectory();
}

export async function rebuildAllAction({
  dataDir,
  log,
  rootDir = dataDir,
}: {
  dataDir: string;
  log: ToolingLog;
  rootDir?: string;
}) {
  const childNames = prioritizeMappings(await readDirectory(dataDir));
  for (const childName of childNames) {
    const childPath = resolve(dataDir, childName);

    if (await isDirectory(childPath)) {
      await rebuildAllAction({
        dataDir: childPath,
        log,
        rootDir,
      });
      continue;
    }

    const archiveName = dirname(relative(rootDir, childPath));
    log.info(`${archiveName} Rebuilding ${childName}`);
    const gzip = isGzip(childPath);
    const tempFile = childPath + (gzip ? '.rebuilding.gz' : '.rebuilding');

    await createPromiseFromStreams([
      createReadStream(childPath) as Readable,
      ...createParseArchiveStreams({ gzip }),
      ...createFormatArchiveStreams({ gzip }),
      createWriteStream(tempFile),
    ] as [Readable, ...Writable[]]);

    await fromNode((cb) => rename(tempFile, childPath, cb));
    log.info(`${archiveName} Rebuilt ${childName}`);
  }
}
