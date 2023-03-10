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

import expect from '@osd/expect';

import { PluginFunctionalProviderContext } from 'test/plugin_functional/services';

// eslint-disable-next-line import/no-default-export
export default function ({ getService }: PluginFunctionalProviderContext) {
  const testSubjects = getService('testSubjects');
  const retry = getService('retry');

  describe('', () => {
    it('hello world action', async () => {
      await testSubjects.click('emitHelloWorldTrigger');
      await retry.try(async () => {
        const text = await testSubjects.getVisibleText('helloWorldActionText');
        expect(text).to.be('Hello world!');
      });

      await testSubjects.click('closeModal');
    });

    it('dynamic hello world action', async () => {
      await testSubjects.click('addDynamicAction');
      await retry.try(async () => {
        await testSubjects.click('emitHelloWorldTrigger');
        await testSubjects.click('embeddablePanelAction-ACTION_HELLO_WORLD-Waldo');
      });
      await retry.try(async () => {
        const text = await testSubjects.getVisibleText('dynamicHelloWorldActionText');
        expect(text).to.be('Hello Waldo');
      });
      await testSubjects.click('closeModal');
    });
  });
}
