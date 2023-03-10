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

import { ReactNode, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { Subject, Subscription } from './lib';

// This type will convert all optional property to required ones
// Comes from https://github.com/microsoft/TypeScript/issues/15012#issuecomment-365453623
type Required<T> = T extends FormData ? { [P in keyof T]-?: NonNullable<T[P]> } : T;

export interface FormHook<T extends FormData = FormData, I extends FormData = T> {
  /**  Flag that indicates if the form has been submitted at least once. It is set to `true` when we call `submit()`. */
  readonly isSubmitted: boolean;
  /** Flag that indicates if the form is being submitted. */
  readonly isSubmitting: boolean;
  /** Flag that indicates if the form is valid. If `undefined` then the form validation has not been checked yet. */
  readonly isValid: boolean | undefined;
  /** The form id. If none was provided, "default" will be returned. */
  readonly id: string;
  /**
   * This handler submits the form and returns its data and validity. If the form is not valid, the data will be `null`
   * as only valid data is passed through the `serializer(s)` before being returned.
   */
  submit: (e?: FormEvent<HTMLFormElement> | MouseEvent) => Promise<{ data: T; isValid: boolean }>;
  /** Use this handler to get the validity of the form. */
  validate: () => Promise<boolean>;
  subscribe: (handler: OnUpdateHandler<T>) => Subscription;
  /** Sets a field value imperatively. */
  setFieldValue: (fieldName: string, value: FieldValue) => void;
  /** Sets a field errors imperatively. */
  setFieldErrors: (fieldName: string, errors: ValidationError[]) => void;
  /** Access any field on the form. */
  getFields: () => FieldsMap;
  /**
   * Return the form data. It accepts an optional options object with an `unflatten` parameter (defaults to `true`).
   * If you are only interested in the raw form data, pass `unflatten: false` to the handler
   */
  getFormData: (options?: { unflatten?: boolean }) => T;
  /* Returns an array with of all errors in the form. */
  getErrors: () => string[];
  /** Resets the form to its initial state. */
  reset: (options?: { resetValues?: boolean; defaultValue?: Partial<T> }) => void;
  readonly __options: Required<FormOptions>;
  __getFormData$: () => Subject<T>;
  __addField: (field: FieldHook) => void;
  __removeField: (fieldNames: string | string[]) => void;
  __validateFields: (
    fieldNames: string[]
  ) => Promise<{ areFieldsValid: boolean; isFormValid: boolean | undefined }>;
  __updateFormDataAt: (field: string, value: unknown) => T;
  __updateDefaultValueAt: (field: string, value: unknown) => void;
  __readFieldConfigFromSchema: (fieldName: string) => FieldConfig;
  __getFieldDefaultValue: (fieldName: string) => unknown;
}

export type FormSchema<T extends FormData = FormData> = {
  [K in keyof T]?: FieldConfig<T[K], T, any> | FormSchema<T[K]>;
};

export interface FormConfig<T extends FormData = FormData, I extends FormData = T> {
  onSubmit?: FormSubmitHandler<T>;
  schema?: FormSchema<I>;
  defaultValue?: Partial<T>;
  serializer?: SerializerFunc<T, I>;
  deserializer?: SerializerFunc<I, T>;
  options?: FormOptions;
  id?: string;
}

export interface OnFormUpdateArg<T extends FormData> {
  data: {
    raw: { [key: string]: any };
    format: () => T;
  };
  validate: () => Promise<boolean>;
  isValid?: boolean;
}

export type OnUpdateHandler<T extends FormData = FormData> = (arg: OnFormUpdateArg<T>) => void;

export interface FormOptions {
  valueChangeDebounceTime?: number;
  /**
   * Remove empty string field ("") from form data
   */
  stripEmptyFields?: boolean;
}

export interface FieldHook<T = unknown, I = T> {
  readonly path: string;
  readonly label?: string;
  readonly labelAppend?: string | ReactNode;
  readonly helpText?: string | ReactNode;
  readonly type: string;
  readonly value: I;
  readonly errors: ValidationError[];
  readonly isValid: boolean;
  readonly isPristine: boolean;
  readonly isValidating: boolean;
  readonly isValidated: boolean;
  readonly isChangingValue: boolean;
  getErrorsMessages: (args?: {
    validationType?: 'field' | string;
    errorCode?: string;
  }) => string | null;
  onChange: (event: ChangeEvent<{ name?: string; value: string; checked?: boolean }>) => void;
  setValue: (value: I | ((prevValue: I) => I)) => void;
  setErrors: (errors: ValidationError[]) => void;
  clearErrors: (type?: string | string[]) => void;
  validate: (validateData?: {
    formData?: any;
    value?: I;
    validationType?: string;
  }) => FieldValidateResponse | Promise<FieldValidateResponse>;
  reset: (options?: { resetValue?: boolean; defaultValue?: T }) => unknown | undefined;
  // Flag to indicate if the field value will be included in the form data outputted
  // when calling form.getFormData();
  __isIncludedInOutput: boolean;
  __serializeValue: (internalValue?: I) => T;
}

export interface FieldConfig<T = unknown, FormType extends FormData = FormData, I = T> {
  readonly label?: string;
  readonly labelAppend?: string | ReactNode;
  readonly helpText?: string | ReactNode;
  readonly type?: string;
  readonly defaultValue?: T;
  readonly validations?: Array<ValidationConfig<FormType, string, I>>;
  readonly formatters?: FormatterFunc[];
  readonly deserializer?: SerializerFunc<I, T>;
  readonly serializer?: SerializerFunc<T, I>;
  readonly fieldsToValidateOnChange?: string[];
  readonly valueChangeDebounceTime?: number;
}

export interface FieldsMap {
  [key: string]: FieldHook;
}

export type FormSubmitHandler<T extends FormData = FormData> = (
  formData: T,
  isValid: boolean
) => Promise<void>;

export interface ValidationError<T = string> {
  message: string;
  code?: T;
  validationType?: string;
  __isBlocking__?: boolean;
  [key: string]: any;
}

export interface ValidationFuncArg<T extends FormData, V = unknown> {
  path: string;
  value: V;
  form: {
    getFormData: FormHook<T>['getFormData'];
    getFields: FormHook<T>['getFields'];
  };
  formData: T;
  errors: readonly ValidationError[];
}

export type ValidationFunc<T extends FormData = any, E extends string = string, V = unknown> = (
  data: ValidationFuncArg<T, V>
) => ValidationError<E> | void | undefined | Promise<ValidationError<E> | void | undefined>;

export interface FieldValidateResponse {
  isValid: boolean;
  errors: ValidationError[];
}

export type SerializerFunc<O = unknown, I = any> = (value: I) => O;

export interface FormData {
  [key: string]: any;
}

type FormatterFunc = (value: any, formData: FormData) => unknown;

// We set it as unknown as a form field can be any of any type
// string | number | boolean | string[] ...
type FieldValue = unknown;

export interface ValidationConfig<
  FormType extends FormData = any,
  Error extends string = string,
  ValueType = unknown
> {
  validator: ValidationFunc<FormType, Error, ValueType>;
  type?: string;
  /**
   * By default all validation are blockers, which means that if they fail, the field is invalid.
   * In some cases, like when trying to add an item to the ComboBox, if the item is not valid we want
   * to show a validation error. But this validation is **not** blocking. Simply, the item has not been added.
   */
  isBlocking?: boolean;
  exitOnFail?: boolean;
}
