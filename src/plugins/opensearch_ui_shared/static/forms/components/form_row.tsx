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

import { EuiDescribedFormGroup, EuiTitle } from '@elastic/eui';
import { FieldHook } from '../hook_form_lib';
import { Field } from './field';

interface Props {
  title: string | JSX.Element;
  description?: string | JSX.Element;
  field?: FieldHook;
  euiFieldProps?: Record<string, any>;
  titleTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
  [key: string]: any;
}

function isTitleString(title: any): title is string {
  return typeof title === 'string' || title.type.name === 'FormattedMessage';
}

export const FormRow = ({
  title,
  idAria,
  description,
  field,
  children,
  titleTag = 'h4',
  ...rest
}: Props) => {
  let titleWrapped;

  // If a string is provided, create a default Euititle of size "m"
  if (isTitleString(title)) {
    // Create the correct title tag
    const titleWithHTag = React.createElement(titleTag, undefined, title);
    titleWrapped = <EuiTitle size="s">{titleWithHTag}</EuiTitle>;
  } else {
    titleWrapped = title;
  }

  return (
    <EuiDescribedFormGroup title={titleWrapped} description={description} fullWidth>
      {children ? children : field ? <Field field={field!} {...rest} /> : null}
    </EuiDescribedFormGroup>
  );
};

/**
 * Get a <FormRow /> component providing some common props for all instances.
 * @param partialProps Partial props to apply to all <FormRow /> instances
 */
export const getFormRow = (partialProps: Partial<Props>) => (props: Partial<Props>) => {
  const componentProps = { ...partialProps, ...props } as Props;
  return <FormRow {...componentProps} />;
};
