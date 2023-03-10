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

import _ from 'lodash';
import { SavedObjectsClientContract } from 'opensearch-dashboards/public';
import { SavedObject, SavedObjectConfig } from '../../types';

/**
 * Initialize saved object
 */
export async function intializeSavedObject(
  savedObject: SavedObject,
  savedObjectsClient: SavedObjectsClientContract,
  config: SavedObjectConfig
) {
  const opensearchType = config.type;
  // ensure that the opensearchType is defined
  if (!opensearchType) throw new Error('You must define a type name to use SavedObject objects.');

  if (!savedObject.id) {
    // just assign the defaults and be done
    _.assign(savedObject, savedObject.defaults);
    await savedObject.hydrateIndexPattern!();
    if (typeof config.afterOpenSearchResp === 'function') {
      savedObject = await config.afterOpenSearchResp(savedObject);
    }
    return savedObject;
  }

  const resp = await savedObjectsClient.get(opensearchType, savedObject.id);
  const respMapped = {
    _id: resp.id,
    _type: resp.type,
    _source: _.cloneDeep(resp.attributes),
    references: resp.references,
    found: !!resp._version,
  };
  await savedObject.applyOpenSearchResp(respMapped);
  if (typeof config.init === 'function') {
    await config.init.call(savedObject);
  }

  return savedObject;
}
