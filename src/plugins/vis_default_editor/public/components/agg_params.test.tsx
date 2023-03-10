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
import { mount } from 'enzyme';

import { IndexPattern, IAggConfig, AggGroupNames } from 'src/plugins/data/public';
import {
  DefaultEditorAggParams as PureDefaultEditorAggParams,
  DefaultEditorAggParamsProps,
} from './agg_params';
import { OpenSearchDashboardsContextProvider } from '../../../opensearch_dashboards_react/public';
import { dataPluginMock } from '../../../data/public/mocks';
import { EditorVisState } from './sidebar/state/reducers';

const mockEditorConfig = {
  useNormalizedOpenSearchInterval: { hidden: false, fixedValue: false },
  interval: {
    hidden: false,
    help: 'Must be a multiple of rollup configuration interval: 1m',
    default: '1m',
    timeBase: '1m',
  },
};
const DefaultEditorAggParams = (props: DefaultEditorAggParamsProps) => (
  <OpenSearchDashboardsContextProvider services={{ data: dataPluginMock.createStartContract() }}>
    <PureDefaultEditorAggParams {...props} />
  </OpenSearchDashboardsContextProvider>
);

jest.mock('./utils', () => ({
  getEditorConfig: jest.fn(() => mockEditorConfig),
}));
jest.mock('./agg_params_helper', () => ({
  getAggParamsToRender: jest.fn(() => ({
    basic: [
      {
        aggParam: {
          displayName: 'Custom label',
          name: 'customLabel',
          type: 'string',
        },
      },
    ],
    advanced: [
      {
        aggParam: {
          advanced: true,
          name: 'json',
          type: 'json',
        },
      },
    ],
  })),
  getAggTypeOptions: jest.fn(() => []),
  getError: jest.fn((agg, aggIsTooLow) => (aggIsTooLow ? ['error'] : [])),
  isInvalidParamsTouched: jest.fn(() => false),
}));
jest.mock('./agg_select', () => ({
  DefaultEditorAggSelect: () => null,
}));
jest.mock('./agg_param', () => ({
  DefaultEditorAggParam: () => null,
}));

describe('DefaultEditorAggParams component', () => {
  let setAggParamValue: jest.Mock;
  let onAggTypeChange: jest.Mock;
  let setTouched: jest.Mock;
  let setValidity: jest.Mock;
  let intervalDeserialize: jest.Mock;
  let defaultProps: DefaultEditorAggParamsProps;

  beforeEach(() => {
    setAggParamValue = jest.fn();
    onAggTypeChange = jest.fn();
    setTouched = jest.fn();
    setValidity = jest.fn();
    intervalDeserialize = jest.fn(() => 'deserialized');

    defaultProps = {
      agg: ({
        type: {
          params: [{ name: 'interval', deserialize: intervalDeserialize }],
        },
        params: {},
        schema: {
          title: '',
        },
      } as any) as IAggConfig,
      groupName: AggGroupNames.Metrics,
      formIsTouched: false,
      indexPattern: {} as IndexPattern,
      metricAggs: [],
      state: {} as EditorVisState,
      setAggParamValue,
      onAggTypeChange,
      setTouched,
      setValidity,
      schemas: [],
    };
  });

  it('should reset the validity to true when destroyed', () => {
    const comp = mount(<DefaultEditorAggParams {...defaultProps} aggIsTooLow={true} />);

    expect(setValidity).lastCalledWith(false);

    comp.unmount();

    expect(setValidity).lastCalledWith(true);
  });

  it('should set fixed and default values when editorConfig is defined (works in rollup index)', () => {
    mount(<DefaultEditorAggParams {...defaultProps} />);

    expect(setAggParamValue).toHaveBeenNthCalledWith(
      1,
      defaultProps.agg.id,
      'useNormalizedOpenSearchInterval',
      false
    );
    expect(intervalDeserialize).toHaveBeenCalledWith('1m');
    expect(setAggParamValue).toHaveBeenNthCalledWith(
      2,
      defaultProps.agg.id,
      'interval',
      'deserialized'
    );
  });

  it('should call setTouched with false when agg type is changed', () => {
    const comp = mount(<DefaultEditorAggParams {...defaultProps} />);

    comp.setProps({ agg: { type: { params: [] } } });

    expect(setTouched).lastCalledWith(false);
  });

  it('should set the validity when it changed', () => {
    const comp = mount(<DefaultEditorAggParams {...defaultProps} />);

    comp.setProps({ aggIsTooLow: true });

    expect(setValidity).lastCalledWith(false);

    comp.setProps({ aggIsTooLow: false });

    expect(setValidity).lastCalledWith(true);
  });

  it('should call setTouched when all invalid controls were touched or they are untouched', () => {
    const comp = mount(<DefaultEditorAggParams {...defaultProps} />);

    comp.setProps({ aggIsTooLow: true });

    expect(setTouched).lastCalledWith(true);

    comp.setProps({ aggIsTooLow: false });

    expect(setTouched).lastCalledWith(false);
  });
});
