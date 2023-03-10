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

export default function ({ getPageObjects, getService }) {
  const PageObjects = getPageObjects(['visualize', 'visEditor', 'visChart', 'header']);
  const find = getService('find');
  const inspector = getService('inspector');
  const markdown = `
# Heading 1

<h3>Inline HTML that should not be rendered as html</h3>
  `;

  describe('markdown app in visualize app', () => {
    before(async function () {
      await PageObjects.visualize.navigateToNewVisualization();
      await PageObjects.visualize.clickMarkdownWidget();
      await PageObjects.visEditor.setMarkdownTxt(markdown);
      await PageObjects.visEditor.clickGo();
    });

    describe('markdown vis', () => {
      it('should not have inspector enabled', async function () {
        await inspector.expectIsNotEnabled();
      });

      it('should render markdown as html', async function () {
        const h1Txt = await PageObjects.visChart.getMarkdownBodyDescendentText('h1');
        expect(h1Txt).to.equal('Heading 1');
      });

      it('should not render html in markdown as html', async function () {
        const expected = 'Heading 1\n<h3>Inline HTML that should not be rendered as html</h3>';
        const actual = await PageObjects.visChart.getMarkdownText();
        expect(actual).to.equal(expected);
      });

      it('should auto apply changes if auto mode is turned on', async function () {
        const markdown2 = '## Heading 2';
        await PageObjects.visEditor.toggleAutoMode();
        await PageObjects.visEditor.setMarkdownTxt(markdown2);
        await PageObjects.header.waitUntilLoadingHasFinished();
        const h1Txt = await PageObjects.visChart.getMarkdownBodyDescendentText('h2');
        expect(h1Txt).to.equal('Heading 2');
      });

      it('should resize the editor', async function () {
        const editorSidebar = await find.byCssSelector('.visEditor__collapsibleSidebar');
        const initialSize = await editorSidebar.getSize();
        await PageObjects.visEditor.sizeUpEditor();
        const afterSize = await editorSidebar.getSize();
        expect(afterSize.width).to.be.greaterThan(initialSize.width);
      });
    });
  });
}
