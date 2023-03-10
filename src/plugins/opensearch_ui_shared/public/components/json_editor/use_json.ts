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

import { useEffect, useState, useRef, useCallback } from 'react';
import { i18n } from '@osd/i18n';

import { isJSON } from '../../../static/validators/string';

export interface JsonEditorState<T = { [key: string]: any }> {
  data: {
    raw: string;
    format(): T;
  };
  validate(): boolean;
  isValid: boolean | undefined;
}

export type OnJsonEditorUpdateHandler<T = { [key: string]: any }> = (
  arg: JsonEditorState<T>
) => void;

interface Parameters<T extends object> {
  onUpdate: OnJsonEditorUpdateHandler<T>;
  defaultValue?: T;
  value?: string;
}

const stringifyJson = (json: { [key: string]: any }) =>
  Object.keys(json).length ? JSON.stringify(json, null, 2) : '{\n\n}';

export const useJson = <T extends object = { [key: string]: any }>({
  defaultValue = {} as T,
  onUpdate,
  value,
}: Parameters<T>) => {
  const isControlled = value !== undefined;
  const isMounted = useRef(false);
  const [content, setContent] = useState<string>(
    isControlled ? value! : stringifyJson(defaultValue)
  );
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    // We allow empty string as it will be converted to "{}""
    const isValid = content.trim() === '' ? true : isJSON(content);
    if (!isValid) {
      setError(
        i18n.translate('opensearchUi.validation.string.invalidJSONError', {
          defaultMessage: 'Invalid JSON',
        })
      );
    } else {
      setError(null);
    }
    return isValid;
  }, [content]);

  const formatContent = useCallback(() => {
    const isValid = validate();
    const data = isValid && content.trim() !== '' ? JSON.parse(content) : {};
    return data as T;
  }, [validate, content]);

  useEffect(() => {
    if (!isMounted.current || isControlled) {
      return;
    }

    const isValid = validate();

    onUpdate({
      data: {
        raw: content,
        format: formatContent,
      },
      validate,
      isValid,
    });
  }, [onUpdate, content, formatContent, validate, isControlled]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    content,
    setContent,
    error,
    isControlled,
  };
};
