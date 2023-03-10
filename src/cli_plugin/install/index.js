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

import { getConfigPath } from '@osd/utils';
import { pkg } from '../../core/server/utils';
import { install } from './install';
import { Logger } from '../lib/logger';
import { parse, parseMilliseconds } from './settings';
import { logWarnings } from '../lib/log_warnings';

function processCommand(command, options) {
  let settings;
  try {
    settings = parse(command, options, pkg);
  } catch (ex) {
    //The logger has not yet been initialized.
    console.error(ex.message);
    process.exit(64);
  }

  const logger = new Logger(settings);

  logWarnings(settings, logger);
  install(settings, logger);
}

export function installCommand(program) {
  program
    .command('install <plugin/url>')
    .option('-q, --quiet', 'disable all process messaging except errors')
    .option('-s, --silent', 'disable all process messaging')
    .option('-c, --config <path>', 'path to the config file', getConfigPath())
    .option(
      '-t, --timeout <duration>',
      'length of time before failing; 0 for never fail',
      parseMilliseconds
    )
    .description(
      'install a plugin',
      `Common examples:
  install file:///Path/to/my/plugin-example.zip
  install https://path.to/my/plugin-example.zip`
    )
    .action(processCommand);
}
