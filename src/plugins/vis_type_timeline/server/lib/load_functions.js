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

import _ from 'lodash';
import glob from 'glob';
import path from 'path';
import processFunctionDefinition from './process_function_definition';

export default function (directory) {
  function getTuple(directory, name) {
    return [name, require('../' + directory + '/' + name)]; // eslint-disable-line import/no-dynamic-require
  }

  // Get a list of all files and use the filename as the object key
  const files = _.map(
    glob
      .sync(path.resolve(__dirname, '../' + directory + '/*.js'))
      .filter((filename) => !filename.includes('.test')),
    function (file) {
      const name = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
      return getTuple(directory, name);
    }
  );

  // Get a list of all directories with an index.js, use the directory name as the key in the object
  const directories = _.chain(glob.sync(path.resolve(__dirname, '../' + directory + '/*/index.js')))
    .map(function (file) {
      const parts = file.split('/');
      const name = parts[parts.length - 2];
      return getTuple(directory, name);
    })
    .value();

  const functions = _.fromPairs(files.concat(directories));

  _.each(functions, function (func) {
    _.assign(functions, processFunctionDefinition(func));
  });

  return functions;
}
