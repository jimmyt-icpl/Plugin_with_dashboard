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

import os from 'os';
import execa from 'execa';

export async function getBuildNumber() {
  if ('BUILD_NUMBER' in process.env) {
    return parseFloat(process.env.BUILD_NUMBER as string);
  }

  if (/^win/.test(os.platform())) {
    // Windows does not have the wc process and `find /C /V ""` does not consistently work
    const log = await execa('git', ['log', '--format="%h"']);
    return log.stdout.split('\n').length;
  }

  const wc = await execa.command('git log --format="%h" | wc -l', {
    shell: true,
  });
  return parseFloat(wc.stdout.trim());
}
