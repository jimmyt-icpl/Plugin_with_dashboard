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
 * Licensed to Elasticsearch B.V under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V licenses this file to you under
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

import { FtrProviderContext } from '../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects([
    'dashboard',
    'header',
    'common',
    'timePicker',
    'visualize',
    'visEditor',
  ]);
  const pieChart = getService('pieChart');
  const browser = getService('browser');
  const find = getService('find');
  const log = getService('log');
  const dashboardAddPanel = getService('dashboardAddPanel');
  const listingTable = getService('listingTable');
  const opensearchArchiver = getService('opensearchArchiver');
  const security = getService('security');

  let opensearchDashboardsLegacyBaseUrl: string;
  let opensearchDashboardsVisualizeBaseUrl: string;
  let testDashboardId: string;

  describe('legacy urls', function describeIndexTests() {
    before(async function () {
      await security.testUser.setRoles(['opensearch_dashboards_admin', 'animals']);
      await opensearchArchiver.load('dashboard/current/opensearch_dashboards');
      await PageObjects.common.navigateToApp('dashboard');
      await PageObjects.dashboard.clickNewDashboard();
      await dashboardAddPanel.addVisualization('Rendering-Test:-animal-sounds-pie');
      await PageObjects.dashboard.saveDashboard('legacyTest', { waitDialogIsClosed: true });
      await PageObjects.header.waitUntilLoadingHasFinished();
      const currentUrl = await browser.getCurrentUrl();
      await log.debug(`Current url is ${currentUrl}`);
      testDashboardId = /#\/view\/(.+)\?/.exec(currentUrl)![1];
      opensearchDashboardsLegacyBaseUrl =
        currentUrl.substring(0, currentUrl.indexOf('/app/dashboards')) +
        '/app/opensearch-dashboards';
      opensearchDashboardsVisualizeBaseUrl =
        currentUrl.substring(0, currentUrl.indexOf('/app/dashboards')) + '/app/visualize';
      await log.debug(`id is ${testDashboardId}`);
    });

    after(async function () {
      await PageObjects.dashboard.gotoDashboardLandingPage();
      await listingTable.deleteItem('legacyTest', testDashboardId);
      await security.testUser.restoreDefaults();
    });

    describe('opensearch-dashboards link redirect', () => {
      it('redirects from old opensearch-dashboards app URL', async () => {
        const url = `${opensearchDashboardsLegacyBaseUrl}#/dashboard/${testDashboardId}`;
        await browser.get(url, true);
        await PageObjects.header.waitUntilLoadingHasFinished();
        await PageObjects.timePicker.setDefaultDataRange();

        await PageObjects.dashboard.waitForRenderComplete();
        await pieChart.expectPieSliceCount(5);
      });

      it('redirects from legacy hash in wrong app', async () => {
        const url = `${opensearchDashboardsVisualizeBaseUrl}#/dashboard/${testDashboardId}`;
        await browser.get(url, true);
        await PageObjects.header.waitUntilLoadingHasFinished();
        await PageObjects.timePicker.setDefaultDataRange();

        await PageObjects.dashboard.waitForRenderComplete();
        await pieChart.expectPieSliceCount(5);
      });

      it('resolves markdown link', async () => {
        await PageObjects.visualize.navigateToNewVisualization();
        await PageObjects.visualize.clickMarkdownWidget();
        await PageObjects.visEditor.setMarkdownTxt(`[abc](#/dashboard/${testDashboardId})`);
        await PageObjects.visEditor.clickGo();
        (await find.byLinkText('abc')).click();

        await PageObjects.header.waitUntilLoadingHasFinished();
        await PageObjects.timePicker.setDefaultDataRange();

        await PageObjects.dashboard.waitForRenderComplete();
        await pieChart.expectPieSliceCount(5);
      });

      it('back button works', async () => {
        // back to default time range
        await browser.goBack();
        // back to last app
        await browser.goBack();
        await PageObjects.visEditor.expectMarkdownTextArea();
        await browser.goForward();
      });
    });
  });
}
