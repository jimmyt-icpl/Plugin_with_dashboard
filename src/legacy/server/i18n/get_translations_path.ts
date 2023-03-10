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

import { promisify } from 'util';
import { readFile } from 'fs';
import { resolve, dirname } from 'path';
import globby from 'globby';

const readFileAsync = promisify(readFile);

interface I18NRCFileStructure {
  translations?: string[];
}

export async function getTranslationPaths({ cwd, glob }: { cwd: string; glob: string }) {
  const entries = await globby(glob, { cwd });
  const translationPaths: string[] = [];

  for (const entry of entries) {
    const entryFullPath = resolve(cwd, entry);
    const pluginBasePath = dirname(entryFullPath);
    try {
      const content = await readFileAsync(entryFullPath, 'utf8');
      const { translations } = JSON.parse(content) as I18NRCFileStructure;
      if (translations && translations.length) {
        translations.forEach((translation) => {
          const translationFullPath = resolve(pluginBasePath, translation);
          translationPaths.push(translationFullPath);
        });
      }
    } catch (err) {
      throw new Error(`Failed to parse .i18nrc.json file at ${entryFullPath}`);
    }
  }

  return translationPaths;
}
