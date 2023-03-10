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
import ReactDOM from 'react-dom';
import { Subscription } from 'rxjs';
import { TodoSavedObjectAttributes } from 'examples/embeddable_examples/common';
import { SavedObjectsClientContract } from 'opensearch-dashboards/public';
import {
  Embeddable,
  IContainer,
  EmbeddableOutput,
  SavedObjectEmbeddableInput,
} from '../../../../src/plugins/embeddable/public';
import { TodoRefEmbeddableComponent } from './todo_ref_component';

// Notice this is not the same value as the 'todo' saved object type. Many of our
// cases in prod today use the same value, but this is unnecessary.
export const TODO_REF_EMBEDDABLE = 'TODO_REF_EMBEDDABLE';

export interface TodoRefInput extends SavedObjectEmbeddableInput {
  /**
   * Optional search string which will be used to highlight search terms as
   * well as calculate `output.hasMatch`.
   */
  search?: string;
}

export interface TodoRefOutput extends EmbeddableOutput {
  /**
   * Should be true if input.search is defined and the task or title contain
   * search as a substring.
   */
  hasMatch: boolean;
  /**
   * Will contain the saved object attributes of the Todo Saved Object that matches
   * `input.savedObjectId`. If the id is invalid, this may be undefined.
   */
  savedAttributes?: TodoSavedObjectAttributes;
}

/**
 * Returns whether any attributes contain the search string.  If search is empty, true is returned. If
 * there are no savedAttributes, false is returned.
 * @param search - the search string
 * @param savedAttributes - the saved object attributes for the saved object with id `input.savedObjectId`
 */
function getHasMatch(search?: string, savedAttributes?: TodoSavedObjectAttributes): boolean {
  if (!search) return true;
  if (!savedAttributes) return false;
  return Boolean(
    (savedAttributes.task && savedAttributes.task.match(search)) ||
      (savedAttributes.title && savedAttributes.title.match(search))
  );
}

/**
 * This is an example of an embeddable that is backed by a saved object. It's essentially the
 * same as `TodoEmbeddable` but that is "by value", while this is "by reference".
 */
export class TodoRefEmbeddable extends Embeddable<TodoRefInput, TodoRefOutput> {
  public readonly type = TODO_REF_EMBEDDABLE;
  private subscription: Subscription;
  private node?: HTMLElement;
  private savedObjectsClient: SavedObjectsClientContract;
  private savedObjectId?: string;

  constructor(
    initialInput: TodoRefInput,
    {
      parent,
      savedObjectsClient,
    }: {
      parent?: IContainer;
      savedObjectsClient: SavedObjectsClientContract;
    }
  ) {
    super(initialInput, { hasMatch: false }, parent);
    this.savedObjectsClient = savedObjectsClient;

    this.subscription = this.getInput$().subscribe(async () => {
      // There is a little more work today for this embeddable because it has
      // more output it needs to update in response to input state changes.
      let savedAttributes: TodoSavedObjectAttributes | undefined;

      // Since this is an expensive task, we save a local copy of the previous
      // savedObjectId locally and only retrieve the new saved object if the id
      // actually changed.
      if (this.savedObjectId !== this.input.savedObjectId) {
        this.savedObjectId = this.input.savedObjectId;
        const todoSavedObject = await this.savedObjectsClient.get<TodoSavedObjectAttributes>(
          'todo',
          this.input.savedObjectId
        );
        savedAttributes = todoSavedObject?.attributes;
      }

      // The search string might have changed as well so we need to make sure we recalculate
      // hasMatch.
      this.updateOutput({
        hasMatch: getHasMatch(this.input.search, savedAttributes),
        savedAttributes,
      });
    });
  }

  public render(node: HTMLElement) {
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node);
    }
    this.node = node;
    ReactDOM.render(<TodoRefEmbeddableComponent embeddable={this} />, node);
  }

  /**
   * Lets re-sync our saved object to make sure it's up to date!
   */
  public async reload() {
    this.savedObjectId = this.input.savedObjectId;
    const todoSavedObject = await this.savedObjectsClient.get<TodoSavedObjectAttributes>(
      'todo',
      this.input.savedObjectId
    );
    const savedAttributes = todoSavedObject?.attributes;
    this.updateOutput({
      hasMatch: getHasMatch(this.input.search, savedAttributes),
      savedAttributes,
    });
  }

  public destroy() {
    super.destroy();
    this.subscription.unsubscribe();
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node);
    }
  }
}
