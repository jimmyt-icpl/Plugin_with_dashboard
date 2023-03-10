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

import { Duration, duration as momentDuration, DurationInputArg2, isDuration } from 'moment';
export { Duration, isDuration };

const timeFormatRegex = /^(0|[1-9][0-9]*)(ms|s|m|h|d|w|M|Y)$/;

function stringToDuration(text: string) {
  const result = timeFormatRegex.exec(text);
  if (!result) {
    const number = Number(text);
    if (typeof number !== 'number' || isNaN(number)) {
      throw new Error(
        `Failed to parse value as time value. Value must be a duration in milliseconds, or follow the format ` +
          `<count>[ms|s|m|h|d|w|M|Y] (e.g. '70ms', '5s', '3d', '1Y'), where the duration is a safe positive integer.`
      );
    }
    return numberToDuration(number);
  }

  const count = parseInt(result[1], 0);
  const unit = result[2] as DurationInputArg2;

  return momentDuration(count, unit);
}

function numberToDuration(numberMs: number) {
  if (!Number.isSafeInteger(numberMs) || numberMs < 0) {
    throw new Error(`Value in milliseconds is expected to be a safe positive integer.`);
  }

  return momentDuration(numberMs);
}

export function ensureDuration(value: Duration | string | number) {
  if (typeof value === 'string') {
    return stringToDuration(value);
  }

  if (typeof value === 'number') {
    return numberToDuration(value);
  }

  return value;
}
