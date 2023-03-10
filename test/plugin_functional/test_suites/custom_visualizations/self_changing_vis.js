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

export default function ({ getService, getPageObjects }) {
  const testSubjects = getService('testSubjects');
  const renderable = getService('renderable');
  const PageObjects = getPageObjects(['common', 'visualize', 'visEditor']);

  async function getCounterValue() {
    return await testSubjects.getVisibleText('counter');
  }

  describe('self changing vis', function describeIndexTests() {
    before(async () => {
      await PageObjects.visualize.navigateToNewVisualization();
      await PageObjects.visualize.clickVisType('self_changing_vis');
    });

    it('should allow updating params via the editor', async () => {
      const editor = await testSubjects.find('counterEditor');
      await editor.clearValue();
      await editor.type('10');
      const isApplyEnabled = await PageObjects.visEditor.isApplyEnabled();
      expect(isApplyEnabled).to.be(true);
      await PageObjects.visEditor.clickGo();
      await renderable.waitForRender();
      const counter = await getCounterValue();
      expect(counter).to.be('10');
    });

    it.skip('should allow changing params from within the vis', async () => {
      await testSubjects.click('counter');
      await renderable.waitForRender();
      const visValue = await getCounterValue();
      expect(visValue).to.be('11');
      const editorValue = await testSubjects.getAttribute('counterEditor', 'value');
      expect(editorValue).to.be('11');
      // If changing a param from within the vis it should immediately apply and not bring editor in an unchanged state
      const isApplyEnabled = await PageObjects.visEditor.isApplyEnabled();
      expect(isApplyEnabled).to.be(false);
    });
  });
}
