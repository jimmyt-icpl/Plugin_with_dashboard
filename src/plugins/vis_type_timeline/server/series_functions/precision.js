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

import { i18n } from '@osd/i18n';
import reduce from '../lib/reduce.js';
import alter from '../lib/alter.js';
import Chainable from '../lib/classes/chainable';

export default new Chainable('precision', {
  args: [
    {
      name: 'inputSeries',
      types: ['seriesList'],
    },
    {
      name: 'precision',
      types: ['number'],
      help: i18n.translate('timeline.help.functions.precision.args.precisionHelpText', {
        defaultMessage: 'The number of digits to truncate each value to',
      }),
    },
  ],
  help: i18n.translate('timeline.help.functions.precisionHelpText', {
    defaultMessage: 'The number of digits to truncate the decimal portion of the value to',
  }),
  fn: async function precisionFn(args) {
    await alter(args, function (eachSeries, precision) {
      eachSeries._meta = eachSeries._meta || {};
      eachSeries._meta.precision = precision;
      return eachSeries;
    });

    return reduce(args, function (a, b) {
      return parseInt(a * Math.pow(10, b), 10) / Math.pow(10, b);
    });
  },
});
