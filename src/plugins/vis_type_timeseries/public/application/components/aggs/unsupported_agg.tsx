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

import React from 'react';
import { EuiCode, EuiTitle } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { AggRow } from './agg_row';
import { MetricsItemsSchema } from '../../../../common/types';
import { DragHandleProps } from '../../../types';

interface UnsupportedAggProps {
  disableDelete: boolean;
  model: MetricsItemsSchema;
  siblings: MetricsItemsSchema[];
  dragHandleProps: DragHandleProps;
  onAdd: () => void;
  onDelete: () => void;
}

export function UnsupportedAgg(props: UnsupportedAggProps) {
  return (
    <AggRow
      disableDelete={props.disableDelete}
      model={props.model}
      onAdd={props.onAdd}
      onDelete={props.onDelete}
      siblings={props.siblings}
      dragHandleProps={props.dragHandleProps}
    >
      <EuiTitle className="tvbAggRow__unavailable" size="xxxs">
        <span>
          <FormattedMessage
            id="visTypeTimeseries.unsupportedAgg.aggIsNotSupportedDescription"
            defaultMessage="The {modelType} aggregation is no longer supported."
            values={{ modelType: <EuiCode>{props.model.type}</EuiCode> }}
          />
        </span>
      </EuiTitle>
    </AggRow>
  );
}
