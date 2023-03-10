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

import glob from 'glob';
import { resolve } from 'path';
import { REPO_ROOT } from '@osd/utils';
import { Project } from './project';

export const PROJECTS = [
  new Project(resolve(REPO_ROOT, 'tsconfig.json')),
  new Project(resolve(REPO_ROOT, 'test/tsconfig.json'), { name: 'opensearch-dashboards/test' }),
  new Project(resolve(REPO_ROOT, 'src/test_utils/tsconfig.json')),
  new Project(resolve(REPO_ROOT, 'src/core/tsconfig.json')),

  // NOTE: using glob.sync rather than glob-all or globby
  // because it takes less than 10 ms, while the other modules
  // both took closer to 1000ms.
  ...glob
    .sync('packages/*/tsconfig.json', { cwd: REPO_ROOT })
    .map((path) => new Project(resolve(REPO_ROOT, path))),
  ...glob
    .sync('src/plugins/*/tsconfig.json', { cwd: REPO_ROOT })
    .map((path) => new Project(resolve(REPO_ROOT, path))),
  ...glob
    .sync('examples/*/tsconfig.json', { cwd: REPO_ROOT })
    .map((path) => new Project(resolve(REPO_ROOT, path))),
  ...glob
    .sync('test/plugin_functional/plugins/*/tsconfig.json', { cwd: REPO_ROOT })
    .map((path) => new Project(resolve(REPO_ROOT, path))),
  ...glob
    .sync('test/interpreter_functional/plugins/*/tsconfig.json', { cwd: REPO_ROOT })
    .map((path) => new Project(resolve(REPO_ROOT, path))),
];

export function filterProjectsByFlag(projectFlag?: string) {
  if (!projectFlag) {
    return PROJECTS;
  }

  const tsConfigPath = resolve(projectFlag);
  return PROJECTS.filter((project) => project.tsConfigPath === tsConfigPath);
}
