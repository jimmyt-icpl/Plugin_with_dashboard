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

import { FtrProviderContext } from '../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects(['common', 'settings', 'header']);
  const opensearchArchiver = getService('opensearchArchiver');
  const opensearchDashboardsServer = getService('opensearchDashboardsServer');
  const a11y = getService('a11y');

  describe('Management', () => {
    before(async () => {
      await opensearchArchiver.load('discover');
      await opensearchArchiver.loadIfNeeded('logstash_functional');
      await opensearchDashboardsServer.uiSettings.update({
        defaultIndex: 'logstash-*',
      });
      await PageObjects.settings.navigateTo();
    });

    after(async () => {
      await opensearchArchiver.unload('logstash_functional');
    });

    it('main view', async () => {
      await a11y.testAppSnapshot();
    });

    it('index pattern page', async () => {
      await PageObjects.settings.clickOpenSearchDashboardsIndexPatterns();
      await a11y.testAppSnapshot();
    });

    it('Single indexpattern view', async () => {
      await PageObjects.settings.clickIndexPatternLogstash();
      await PageObjects.header.waitUntilLoadingHasFinished();
      await a11y.testAppSnapshot();
    });

    it('Open create index pattern wizard', async () => {
      await PageObjects.settings.clickOpenSearchDashboardsIndexPatterns();
      await PageObjects.settings.clickAddNewIndexPatternButton();
      await PageObjects.header.waitUntilLoadingHasFinished();
      await a11y.testAppSnapshot();
    });

    // We are navigating back to index pattern page to test field formatters
    it('Navigate back to logstash index page', async () => {
      await PageObjects.settings.clickOpenSearchDashboardsIndexPatterns();
      await PageObjects.settings.clickIndexPatternLogstash();
      await a11y.testAppSnapshot();
    });

    it('Edit field type', async () => {
      await PageObjects.settings.clickEditFieldFormat();
      await a11y.testAppSnapshot();
    });

    it('Advanced settings', async () => {
      await PageObjects.settings.clickOpenSearchDashboardsSettings();
      await a11y.testAppSnapshot();
    });
  });
}
