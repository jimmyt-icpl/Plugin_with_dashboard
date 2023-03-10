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

import { WebDriver, logging } from 'selenium-webdriver';
import * as Rx from 'rxjs';
import { mergeMap, catchError, repeatWhen, mergeMapTo, delay } from 'rxjs/operators';

/**
 * Create an observable that emits log entries representing the calls to log messages
 * available for a specific logger.
 */
export function pollForLogEntry$(driver: WebDriver, type: string, ms: number) {
  const logCtrl = driver.manage().logs();

  // setup log polling
  return Rx.defer(async () => await logCtrl.get(type)).pipe(
    // filter and flatten list of entries
    mergeMap((entries) =>
      entries.filter((entry) => {
        // ignore react devtools
        if (entry.message.includes('Download the React DevTools')) {
          return false;
        }

        // down-level inline script errors
        if (entry.message.includes('Refused to execute inline script')) {
          entry.level = logging.getLevel('INFO');
        }

        return true;
      })
    ),

    // repeat when parent completes, delayed by `ms` milliseconds
    repeatWhen(($) => $.pipe(delay(ms))),

    catchError((error, resubscribe) => {
      return Rx.concat(
        // log error as a log entry
        [new logging.Entry('SEVERE', `ERROR FETCHING BROWSR LOGS: ${error.message}`)],

        // pause 10 seconds then resubscribe
        Rx.of(1).pipe(delay(10 * 1000), mergeMapTo(resubscribe))
      );
    })
  );
}
