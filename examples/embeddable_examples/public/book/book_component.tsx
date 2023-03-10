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
import { EuiFlexItem, EuiFlexGroup, EuiIcon } from '@elastic/eui';

import { EuiText } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { withEmbeddableSubscription } from '../../../../src/plugins/embeddable/public';
import { BookEmbeddableInput, BookEmbeddableOutput, BookEmbeddable } from './book_embeddable';

interface Props {
  input: BookEmbeddableInput;
  output: BookEmbeddableOutput;
  embeddable: BookEmbeddable;
}

function wrapSearchTerms(task?: string, search?: string) {
  if (!search || !task) return task;
  const parts = task.split(new RegExp(`(${search})`, 'g'));
  return parts.map((part, i) =>
    part === search ? (
      <span key={i} style={{ backgroundColor: 'yellow' }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function BookEmbeddableComponentInner({
  input: { search },
  output: { attributes },
  embeddable,
}: Props) {
  const title = attributes?.title;
  const author = attributes?.author;
  const readIt = attributes?.readIt;

  const byReference = embeddable.inputIsRefType(embeddable.getInput());

  return (
    <EuiFlexGroup gutterSize="s">
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="s">
          {title ? (
            <EuiFlexItem>
              <EuiText data-test-subj="bookEmbeddableTitle">
                <h3>{wrapSearchTerms(title, search)}</h3>
              </EuiText>
            </EuiFlexItem>
          ) : null}
          {author ? (
            <EuiFlexItem>
              <EuiText data-test-subj="bookEmbeddableAuthor">
                -{wrapSearchTerms(author, search)}
              </EuiText>
            </EuiFlexItem>
          ) : null}
          {readIt ? (
            <EuiFlexItem>
              <EuiIcon type="check" />
            </EuiFlexItem>
          ) : (
            <EuiFlexItem>
              <EuiIcon type="cross" />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText data-test-subj="bookEmbeddableAuthor">
          <EuiIcon type={byReference ? 'folderCheck' : 'folderExclamation'} />{' '}
          <span>
            {byReference
              ? i18n.translate('embeddableExamples.book.byReferenceLabel', {
                  defaultMessage: 'Book is By Reference',
                })
              : i18n.translate('embeddableExamples.book.byValueLabel', {
                  defaultMessage: 'Book is By Value',
                })}
          </span>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export const BookEmbeddableComponent = withEmbeddableSubscription<
  BookEmbeddableInput,
  BookEmbeddableOutput,
  BookEmbeddable,
  {}
>(BookEmbeddableComponentInner);
