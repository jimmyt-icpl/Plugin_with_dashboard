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

import React, { useEffect } from 'react';
import { i18n } from '@osd/i18n';
import { SwitchParamEditor } from './switch';

import { search } from '../../../../data/public';
import { AggParamEditorProps } from '../agg_param_props';

function MissingBucketParamEditor(props: AggParamEditorProps<boolean>) {
  const fieldTypeIsNotString = !search.aggs.isStringType(props.agg);
  const { setValue } = props;

  useEffect(() => {
    if (fieldTypeIsNotString) {
      setValue(false);
    }
  }, [fieldTypeIsNotString, setValue]);

  return (
    <SwitchParamEditor
      {...props}
      dataTestSubj="missingBucketSwitch"
      displayLabel={i18n.translate('visDefaultEditor.controls.otherBucket.showMissingValuesLabel', {
        defaultMessage: 'Show missing values',
      })}
      displayToolTip={i18n.translate(
        'visDefaultEditor.controls.otherBucket.showMissingValuesTooltip',
        {
          defaultMessage:
            'Only works for fields of type "string". When enabled, include documents with missing ' +
            'values in the search. If this bucket is in the top N, it appears in the chart. ' +
            'If not in the top N, and you enable "Group other values in separate bucket", ' +
            'OpenSearch adds the missing values to the "other" bucket.',
        }
      )}
      disabled={fieldTypeIsNotString}
    />
  );
}

export { MissingBucketParamEditor };
