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
import {
  OPENSEARCH_DASHBOARDS_ROOT,
  OPENSEARCH_DASHBOARDS_EXEC,
  OPENSEARCH_DASHBOARDS_EXEC_PATH,
} from './paths';

function extendNodeOptions(installDir) {
  if (!installDir) {
    return {};
  }

  const testOnlyRegisterPath = relative(
    installDir,
    require.resolve('./babel_register_for_test_plugins')
  );

  return {
    NODE_OPTIONS: `--require=${testOnlyRegisterPath}${
      process.env.NODE_OPTIONS ? ` ${process.env.NODE_OPTIONS}` : ''
    }`,
  };
}

export async function runOpenSearchDashboardsServer({ procs, config, options }) {
  const { installDir } = options;

  await procs.run('opensearch-dashboards', {
    cmd: getOpenSearchDashboardsCmd(installDir),
    args: filterCliArgs(collectCliArgs(config, options)),
    env: {
      FORCE_COLOR: 1,
      ...process.env,
      ...extendNodeOptions(installDir),
    },
    cwd: installDir || OPENSEARCH_DASHBOARDS_ROOT,
    wait: /http server running/,
  });
}

function getOpenSearchDashboardsCmd(installDir) {
  if (installDir) {
    return process.platform.startsWith('win')
      ? resolve(installDir, 'bin/opensearch_dashboards.bat')
      : resolve(installDir, 'bin/opensearch_dashboards');
  }

  return OPENSEARCH_DASHBOARDS_EXEC;
}

/**
 * When installDir is passed, we run from a built version of OpenSearch Dashboards,
 * which uses different command line arguments. If installDir is not
 * passed, we run from source code. We also allow passing in extra
 * OpenSearch Dashboards server options, so we tack those on here.
 */
function collectCliArgs(config, { installDir, extraOsdOpts }) {
  const buildArgs = config.get('osdTestServer.buildArgs') || [];
  const sourceArgs = config.get('osdTestServer.sourceArgs') || [];
  const serverArgs = config.get('osdTestServer.serverArgs') || [];

  return pipe(
    serverArgs,
    (args) => (installDir ? args.filter((a) => a !== '--oss') : args),
    (args) =>
      installDir
        ? [...buildArgs, ...args]
        : [OPENSEARCH_DASHBOARDS_EXEC_PATH, ...sourceArgs, ...args],
    (args) => args.concat(extraOsdOpts || [])
  );
}

/**
 * Filter the cli args to remove duplications and
 * overridden options
 */
function filterCliArgs(args) {
  return args.reduce((acc, val, ind) => {
    // If original argv has a later basepath setting, skip this val.
    if (isBasePathSettingOverridden(args, val, ind)) {
      return acc;
    }

    // Check if original argv has a later setting that overrides
    // the current val. If so, skip this val.
    if (
      !allowsDuplicate(val) &&
      findIndexFrom(args, ++ind, (opt) => opt.split('=')[0] === val.split('=')[0]) > -1
    ) {
      return acc;
    }

    return [...acc, val];
  }, []);
}

/**
 * Apply each function in fns to the result of the
 * previous function. The first function's input
 * is the arr array.
 */
function pipe(arr, ...fns) {
  return fns.reduce((acc, fn) => {
    return fn(acc);
  }, arr);
}

/**
 * Checks whether a specific parameter is allowed to appear multiple
 * times in the OpenSearch Dashboards parameters.
 */
function allowsDuplicate(val) {
  return ['--plugin-path'].includes(val.split('=')[0]);
}

function isBasePathSettingOverridden(args, val, ind) {
  const key = val.split('=')[0];
  const basePathKeys = ['--no-base-path', '--server.basePath'];

  if (basePathKeys.includes(key)) {
    if (findIndexFrom(args, ++ind, (opt) => basePathKeys.includes(opt.split('=')[0])) > -1) {
      return true;
    }
  }

  return false;
}

function findIndexFrom(array, index, ...args) {
  return [...array].slice(index).findIndex(...args);
}
