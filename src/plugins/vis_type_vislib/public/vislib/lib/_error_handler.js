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
import { ContainerTooSmall } from '../errors';

/**
 * Common errors shared between constructors
 *
 * @class ErrorHandler
 * @constructor
 */
export class ErrorHandler {
  constructor() {}

  /**
   * Validates the height and width are > 0
   * min size must be at least 1 px
   *
   * @method validateWidthandHeight
   * @param width {Number} HTMLElement width
   * @param height {Number} HTMLElement height
   * @returns {HTMLElement} HTML div with an error message
   */
  validateWidthandHeight(width, height) {
    const badWidth = _.isNaN(width) || width <= 0;
    const badHeight = _.isNaN(height) || height <= 0;

    if (badWidth || badHeight) {
      throw new ContainerTooSmall();
    }
  }
}
