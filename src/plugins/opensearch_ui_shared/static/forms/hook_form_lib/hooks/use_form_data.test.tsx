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
import { act } from 'react-dom/test-utils';

import { registerTestBed, TestBed } from '../shared_imports';
import { Form, UseField } from '../components';
import { useForm } from './use_form';
import { useFormData, HookReturn } from './use_form_data';

interface Props {
  onChange(data: HookReturn): void;
  watch?: string | string[];
}

describe('useFormData() hook', () => {
  const HookListenerComp = React.memo(({ onChange, watch }: Props) => {
    const hookValue = useFormData({ watch });

    useEffect(() => {
      onChange(hookValue);
    }, [hookValue, onChange]);

    return null;
  });

  describe('form data updates', () => {
    let testBed: TestBed;
    let onChangeSpy: jest.Mock;

    const getLastMockValue = () => {
      return onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1][0] as HookReturn;
    };

    const TestComp = (props: Props) => {
      const { form } = useForm();

      return (
        <Form form={form}>
          <UseField path="title" defaultValue="titleInitialValue" data-test-subj="titleField" />
          <HookListenerComp {...props} />
        </Form>
      );
    };

    const setup = registerTestBed(TestComp, {
      memoryRouter: { wrapComponent: false },
    });

    beforeEach(() => {
      onChangeSpy = jest.fn();
      testBed = setup({ onChange: onChangeSpy }) as TestBed;
    });

    test('should return the form data', () => {
      // Called twice:
      // once when the hook is called and once when the fields have mounted and updated the form data
      expect(onChangeSpy).toBeCalledTimes(2);
      const [data] = getLastMockValue();
      expect(data).toEqual({ title: 'titleInitialValue' });
    });

    test('should listen to field changes', async () => {
      const {
        form: { setInputValue },
      } = testBed;

      await act(async () => {
        setInputValue('titleField', 'titleChanged');
      });

      expect(onChangeSpy).toBeCalledTimes(3);
      const [data] = getLastMockValue();
      expect(data).toEqual({ title: 'titleChanged' });
    });
  });

  describe('format form data', () => {
    let onChangeSpy: jest.Mock;

    const getLastMockValue = () => {
      return onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1][0] as HookReturn;
    };

    const TestComp = (props: Props) => {
      const { form } = useForm();

      return (
        <Form form={form}>
          <UseField path="user.firstName" defaultValue="John" />
          <UseField path="user.lastName" defaultValue="Snow" />
          <HookListenerComp {...props} />
        </Form>
      );
    };

    const setup = registerTestBed(TestComp, {
      memoryRouter: { wrapComponent: false },
    });

    beforeEach(() => {
      onChangeSpy = jest.fn();
      setup({ onChange: onChangeSpy });
    });

    test('should expose a handler to build the form data', () => {
      const { 1: format } = getLastMockValue();
      expect(format()).toEqual({
        user: {
          firstName: 'John',
          lastName: 'Snow',
        },
      });
    });
  });

  describe('options', () => {
    describe('watch', () => {
      let testBed: TestBed;
      let onChangeSpy: jest.Mock;

      const getLastMockValue = () => {
        return onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1][0] as HookReturn;
      };

      const TestComp = (props: Props) => {
        const { form } = useForm();

        return (
          <Form form={form}>
            <UseField path="title" defaultValue="titleInitialValue" data-test-subj="titleField" />
            <HookListenerComp {...props} />
            <UseField
              path="subTitle"
              defaultValue="subTitleInitialValue"
              data-test-subj="subTitleField"
            />
          </Form>
        );
      };

      const setup = registerTestBed(TestComp, {
        memoryRouter: { wrapComponent: false },
      });

      beforeEach(() => {
        onChangeSpy = jest.fn();
        testBed = setup({ watch: 'title', onChange: onChangeSpy }) as TestBed;
      });

      test('should not listen to changes on fields we are not interested in', async () => {
        const {
          form: { setInputValue },
        } = testBed;

        await act(async () => {
          // Changing a field we are **not** interested in
          setInputValue('subTitleField', 'subTitleChanged');
          // Changing a field we **are** interested in
          setInputValue('titleField', 'titleChanged');
        });

        const [data] = getLastMockValue();
        expect(data).toEqual({ title: 'titleChanged', subTitle: 'subTitleInitialValue' });
      });
    });

    describe('form', () => {
      let testBed: TestBed;
      let onChangeSpy: jest.Mock;

      const getLastMockValue = () => {
        return onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1][0] as HookReturn;
      };

      const TestComp = ({ onChange }: Props) => {
        const { form } = useForm();
        const hookValue = useFormData({ form });

        useEffect(() => {
          onChange(hookValue);
        }, [hookValue, onChange]);

        return (
          <Form form={form}>
            <UseField path="title" defaultValue="titleInitialValue" data-test-subj="titleField" />
          </Form>
        );
      };

      const setup = registerTestBed(TestComp, {
        memoryRouter: { wrapComponent: false },
      });

      beforeEach(() => {
        onChangeSpy = jest.fn();
        testBed = setup({ onChange: onChangeSpy }) as TestBed;
      });

      test('should allow a form to be provided when the hook is called outside of the FormDataContext', async () => {
        const {
          form: { setInputValue },
        } = testBed;

        const [initialData] = getLastMockValue();
        expect(initialData).toEqual({ title: 'titleInitialValue' });

        await act(async () => {
          setInputValue('titleField', 'titleChanged');
        });

        const [updatedData] = getLastMockValue();
        expect(updatedData).toEqual({ title: 'titleChanged' });
      });
    });
  });
});
