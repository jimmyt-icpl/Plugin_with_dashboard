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

import expect from '@osd/expect/expect.js';
import { FtrProviderContext } from '../ftr_provider_context';

export function ErrorPageProvider({ getPageObjects }: FtrProviderContext) {
  const { common } = getPageObjects(['common']);

  class ErrorPage {
    public async expectForbidden() {
      const messageText = await common.getBodyText();
      expect(messageText).to.contain('You do not have permission to access the requested page');
    }

    public async expectNotFound() {
      const messageText = await common.getJsonBodyText();
      expect(messageText).to.eql(
        JSON.stringify({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found',
        })
      );
    }
  }

  return new ErrorPage();
}
