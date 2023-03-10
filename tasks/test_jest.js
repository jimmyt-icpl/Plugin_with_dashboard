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

const { resolve } = require('path');

module.exports = function (grunt) {
  grunt.registerTask('test:jest', function () {
    const done = this.async();
    runJest(resolve(__dirname, '../scripts/jest.js'), ['--maxWorkers=10']).then(done, done);
  });

  grunt.registerTask('test:jest_integration', function () {
    const done = this.async();
    runJest(resolve(__dirname, '../scripts/jest_integration.js')).then(done, done);
  });

  function runJest(jestScript, args = []) {
    const serverCmd = {
      cmd: 'node',
      args: [jestScript, '--ci', ...args],
      opts: { stdio: 'inherit' },
    };

    return new Promise((resolve, reject) => {
      grunt.util.spawn(serverCmd, (error, result, code) => {
        if (error || code !== 0) {
          const error = new Error(`jest exited with code ${code}`);
          grunt.fail.fatal(error);
          reject(error);
          return;
        }

        grunt.log.writeln(result);
        resolve();
      });
    });
  }
};
