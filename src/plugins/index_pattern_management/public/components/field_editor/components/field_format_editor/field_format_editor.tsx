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

import React, { PureComponent, Fragment } from 'react';
import { DefaultFormatEditor } from '../../components/field_format_editor/editors/default';

export interface FieldFormatEditorProps {
  fieldType: string;
  fieldFormat: DefaultFormatEditor;
  fieldFormatId: string;
  fieldFormatParams: { [key: string]: unknown };
  fieldFormatEditors: any;
  onChange: (change: { fieldType: string; [key: string]: any }) => void;
  onError: (error?: string) => void;
}

interface EditorComponentProps {
  fieldType: FieldFormatEditorProps['fieldType'];
  format: FieldFormatEditorProps['fieldFormat'];
  formatParams: FieldFormatEditorProps['fieldFormatParams'];
  onChange: FieldFormatEditorProps['onChange'];
  onError: FieldFormatEditorProps['onError'];
}

interface FieldFormatEditorState {
  EditorComponent: React.FC<EditorComponentProps>;
}

export class FieldFormatEditor extends PureComponent<
  FieldFormatEditorProps,
  FieldFormatEditorState
> {
  constructor(props: FieldFormatEditorProps) {
    super(props);
    this.state = {
      EditorComponent: props.fieldFormatEditors.getById(props.fieldFormatId),
    };
  }

  static getDerivedStateFromProps(nextProps: FieldFormatEditorProps) {
    return {
      EditorComponent: nextProps.fieldFormatEditors.getById(nextProps.fieldFormatId) || null,
    };
  }

  render() {
    const { EditorComponent } = this.state;
    const { fieldType, fieldFormat, fieldFormatParams, onChange, onError } = this.props;

    return (
      <Fragment>
        {EditorComponent ? (
          <EditorComponent
            fieldType={fieldType}
            format={fieldFormat}
            formatParams={fieldFormatParams}
            onChange={onChange}
            onError={onError}
          />
        ) : null}
      </Fragment>
    );
  }
}
