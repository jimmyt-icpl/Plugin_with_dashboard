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
import { mountWithIntl, shallowWithIntl } from 'test_utils/enzyme_helpers';
import {
  AggregateValueProp,
  TopAggregateParamEditor,
  TopAggregateParamEditorProps,
} from './top_aggregate';
import { aggParamCommonPropsMock } from './test_utils';
import { IAggConfig } from 'src/plugins/data/public';

describe('TopAggregateParamEditor', () => {
  let agg: IAggConfig;
  let aggParam: any;
  let defaultProps: TopAggregateParamEditorProps;
  let options: AggregateValueProp[];

  beforeEach(() => {
    options = [
      {
        text: 'Min',
        isCompatible: jest.fn((aggr: IAggConfig) => aggr.params.field.type === 'number'),
        value: 'min',
      },
      {
        text: 'Max',
        isCompatible: jest.fn((aggr: IAggConfig) => aggr.params.field.type === 'number'),
        value: 'max',
      },
      {
        text: 'Average',
        isCompatible: jest.fn((aggr: IAggConfig) => aggr.params.field.type === 'string'),
        value: 'average',
      },
    ];
    Object.defineProperty(options, 'byValue', {
      get: () =>
        options.reduce((acc: { [key: string]: AggregateValueProp }, option: AggregateValueProp) => {
          acc[option.value] = { ...option };

          return acc;
        }, {}),
    });
    aggParam = {
      options,
    };
    agg = ({
      params: {
        field: {
          type: 'number',
        },
      },
      getAggParams: jest.fn(() => [{ name: 'aggregate', options }]),
    } as any) as IAggConfig;
    defaultProps = {
      ...aggParamCommonPropsMock,
      agg,
      aggParam,
      setValue: jest.fn(),
      setValidity: jest.fn(),
      setTouched: jest.fn(),
    };
  });

  it('should init with the default set of props', () => {
    const comp = shallowWithIntl(<TopAggregateParamEditor {...defaultProps} />);

    expect(comp).toMatchSnapshot();
  });

  it('should be disabled if a field type is set but there are no compatible options', () => {
    options = [];
    const comp = mountWithIntl(<TopAggregateParamEditor {...defaultProps} showValidation={true} />);
    const select = comp.find('select');

    expect(defaultProps.setValidity).toHaveBeenCalledWith(true);
    expect(comp.children().props()).toHaveProperty('isInvalid', false);
    expect(select.children()).toHaveLength(1);
    expect(select.props()).toHaveProperty('disabled', true);
  });

  it('should change its validity due to passed props', () => {
    const comp = mountWithIntl(
      <TopAggregateParamEditor {...defaultProps} value={{ value: 'min' } as AggregateValueProp} />
    );

    expect(defaultProps.setValidity).toHaveBeenCalledWith(true);

    comp.setProps({ showValidation: true, value: undefined });

    expect(comp.children().props()).toHaveProperty('isInvalid', true);
    expect(defaultProps.setValidity).toHaveBeenCalledWith(false);

    comp.setProps({ value: { value: 'max' } });
    const select = comp.find('select');

    expect(comp.children().props()).toHaveProperty('isInvalid', false);
    expect(defaultProps.setValidity).toHaveBeenCalledWith(true);
    expect(defaultProps.setValidity).toHaveBeenCalledTimes(3);
    expect(select.children()).toHaveLength(3);
    expect(select.prop('value')).toEqual('max');
  });

  it('should call setValue on change', () => {
    const comp = mountWithIntl(
      <TopAggregateParamEditor {...defaultProps} value={{ value: 'min' } as AggregateValueProp} />
    );
    const select = comp.find('select');

    expect(defaultProps.setValue).not.toHaveBeenCalled();

    select.simulate('change', { target: { value: 'EMPTY_VALUE' } });

    expect(defaultProps.setValue).toHaveBeenCalledWith();

    select.simulate('change', { target: { value: 'max' } });
    expect(defaultProps.setValue).toHaveBeenCalledWith(options[1]);
  });

  it('should reflect on fieldType changes', () => {
    const comp = mountWithIntl(
      <TopAggregateParamEditor {...defaultProps} value={{ value: 'min' } as AggregateValueProp} />
    );

    // should not be called on the first render
    expect(defaultProps.setValue).not.toHaveBeenCalled();

    agg = {
      ...agg,
      params: {
        field: {
          type: 'string',
        },
      },
    } as IAggConfig;

    comp.setProps({ agg });

    // should not reflect if field type was changed but options are still available
    expect(defaultProps.setValue).not.toHaveBeenCalledWith();

    options.shift();
    agg = {
      ...agg,
      params: {
        field: {
          type: 'date',
        },
      },
    } as IAggConfig;

    comp.setProps({ agg });

    // should clear the value if the option is unavailable
    expect(defaultProps.setValue).toHaveBeenCalledWith();

    agg = {
      ...agg,
      params: {
        field: {
          type: 'string',
        },
      },
    } as IAggConfig;

    comp.setProps({ agg, value: undefined });

    // should set an option by default if it is only available
    expect(defaultProps.setValue).toHaveBeenCalledWith(options[1]);
  });
});
