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

import { SavedObjectsClientContract } from 'opensearch-dashboards/server';
import { IFieldType, IndexPatternAttributes, SavedObject } from '../../common';

export const getFieldByName = (
  fieldName: string,
  indexPattern: SavedObject<IndexPatternAttributes>
): IFieldType | undefined => {
  const fields: IFieldType[] = indexPattern && JSON.parse(indexPattern.attributes.fields);
  const field = fields && fields.find((f) => f.name === fieldName);

  return field;
};

export const findIndexPatternById = async (
  savedObjectsClient: SavedObjectsClientContract,
  index: string
): Promise<SavedObject<IndexPatternAttributes> | undefined> => {
  const savedObjectsResponse = await savedObjectsClient.find<IndexPatternAttributes>({
    type: 'index-pattern',
    fields: ['fields'],
    search: `"${index}"`,
    searchFields: ['title'],
  });

  if (savedObjectsResponse.total > 0) {
    return savedObjectsResponse.saved_objects[0];
  }
};
