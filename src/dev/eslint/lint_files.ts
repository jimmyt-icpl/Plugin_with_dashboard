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

import { CLIEngine } from 'eslint';

import { REPO_ROOT } from '@osd/utils';
import { createFailError, ToolingLog } from '@osd/dev-utils';
import { File } from '../file';

/**
 * Lints a list of files with eslint. eslint reports are written to the log
 * and a FailError is thrown when linting errors occur.
 *
 * @param  {ToolingLog} log
 * @param  {Array<File>} files
 * @return {undefined}
 */
export function lintFiles(log: ToolingLog, files: File[], { fix }: { fix?: boolean } = {}) {
  const cli = new CLIEngine({
    cache: true,
    cwd: REPO_ROOT,
    fix,
  });

  const paths = files.map((file) => file.getRelativePath());
  const report = cli.executeOnFiles(paths);

  if (fix) {
    CLIEngine.outputFixes(report);
  }

  const failTypes = [];
  if (report.errorCount > 0) failTypes.push('errors');
  if (report.warningCount > 0) failTypes.push('warning');

  if (!failTypes.length) {
    log.success('[eslint] %d files linted successfully', files.length);
    return;
  }

  log.error(cli.getFormatter()(report.results));
  throw createFailError(`[eslint] ${failTypes.join(' & ')}`);
}
