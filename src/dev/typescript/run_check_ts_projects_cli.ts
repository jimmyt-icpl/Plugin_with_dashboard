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

import { resolve, relative } from 'path';

import execa from 'execa';

import { run } from '@osd/dev-utils';
import { REPO_ROOT } from '@osd/utils';

import { File } from '../file';
import { PROJECTS } from './projects';

export async function runCheckTsProjectsCli() {
  run(
    async ({ log }) => {
      const { stdout: files } = await execa('git', ['ls-tree', '--name-only', '-r', 'HEAD'], {
        cwd: REPO_ROOT,
      });

      const isNotInTsProject: File[] = [];
      const isInMultipleTsProjects: string[] = [];

      for (const lineRaw of files.split('\n')) {
        const line = lineRaw.trim();

        if (!line) {
          continue;
        }

        const file = new File(resolve(REPO_ROOT, line));
        if (!file.isTypescript() || file.isFixture()) {
          continue;
        }

        log.verbose('Checking %s', file.getAbsolutePath());

        const projects = PROJECTS.filter((p) => p.isAbsolutePathSelected(file.getAbsolutePath()));
        if (projects.length === 0) {
          isNotInTsProject.push(file);
        }
        if (projects.length > 1 && !file.isTypescriptAmbient()) {
          isInMultipleTsProjects.push(
            ` - ${file.getRelativePath()}:\n${projects
              .map((p) => `   - ${relative(process.cwd(), p.tsConfigPath)}`)
              .join('\n')}`
          );
        }
      }

      if (!isNotInTsProject.length && !isInMultipleTsProjects.length) {
        log.success('All ts files belong to a single ts project');
        return;
      }

      if (isNotInTsProject.length) {
        log.error(
          `The following files do not belong to a tsconfig.json file, or that tsconfig.json file is not listed in src/dev/typescript/projects.ts\n${isNotInTsProject
            .map((file) => ` - ${file.getRelativePath()}`)
            .join('\n')}`
        );
      }

      if (isInMultipleTsProjects.length) {
        const details = isInMultipleTsProjects.join('\n');
        log.error(
          `The following files belong to multiple tsconfig.json files listed in src/dev/typescript/projects.ts\n${details}`
        );
      }

      process.exit(1);
    },
    {
      description:
        'Check that all .ts and .tsx files in the repository are assigned to a tsconfig.json file',
    }
  );
}
