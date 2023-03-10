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
import { ValueMember, Value } from './validated_dual_range';

const LOWER_VALUE_INDEX = 0;
const UPPER_VALUE_INDEX = 1;

export function isRangeValid(
  value: Value = [0, 0],
  min: ValueMember = 0,
  max: ValueMember = 0,
  allowEmptyRange?: boolean
) {
  allowEmptyRange = typeof allowEmptyRange === 'boolean' ? allowEmptyRange : true; // cannot use default props since that uses falsy check
  let lowerValue: ValueMember = isNaN(value[LOWER_VALUE_INDEX] as number)
    ? ''
    : `${value[LOWER_VALUE_INDEX]}`;
  let upperValue: ValueMember = isNaN(value[UPPER_VALUE_INDEX] as number)
    ? ''
    : `${value[UPPER_VALUE_INDEX]}`;

  const isLowerValueValid = lowerValue.toString() !== '';
  const isUpperValueValid = upperValue.toString() !== '';
  if (isLowerValueValid) {
    lowerValue = parseFloat(lowerValue);
  }
  if (isUpperValueValid) {
    upperValue = parseFloat(upperValue);
  }
  let isValid = true;
  let errorMessage = '';

  const bothMustBeSetErrorMessage = i18n.translate(
    'opensearch-dashboards-react.dualRangeControl.mustSetBothErrorMessage',
    {
      defaultMessage: 'Both lower and upper values must be set',
    }
  );
  if (!allowEmptyRange && (!isLowerValueValid || !isUpperValueValid)) {
    isValid = false;
    errorMessage = bothMustBeSetErrorMessage;
  } else if (
    (!isLowerValueValid && isUpperValueValid) ||
    (isLowerValueValid && !isUpperValueValid)
  ) {
    isValid = false;
    errorMessage = bothMustBeSetErrorMessage;
  } else if ((isLowerValueValid && lowerValue < min) || (isUpperValueValid && upperValue > max)) {
    isValid = false;
    errorMessage = i18n.translate(
      'opensearch-dashboards-react.dualRangeControl.outsideOfRangeErrorMessage',
      {
        defaultMessage: 'Values must be on or between {min} and {max}',
        values: { min, max },
      }
    );
  } else if (isLowerValueValid && isUpperValueValid && upperValue < lowerValue) {
    isValid = false;
    errorMessage = i18n.translate(
      'opensearch-dashboards-react.dualRangeControl.upperValidErrorMessage',
      {
        defaultMessage: 'Upper value must be greater or equal to lower value',
      }
    );
  }

  return {
    isValid,
    errorMessage,
  };
}
