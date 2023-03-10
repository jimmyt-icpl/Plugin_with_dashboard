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
import { FtrProviderContext } from '../../ftr_provider_context';

export function OpenSearchChartProvider({ getService }: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const find = getService('find');
  const retry = getService('retry');
  const log = getService('log');

  class OpenSearchChart {
    public async getCanvas() {
      return await find.byCssSelector('.echChart canvas:last-of-type');
    }

    public async canvasExists() {
      return await find.existsByCssSelector('.echChart canvas:last-of-type');
    }

    public async waitForRenderComplete(dataTestSubj: string) {
      const chart = await testSubjects.find(dataTestSubj);
      const rendered = await chart.findAllByCssSelector('.echChart[data-ech-render-complete=true]');
      expect(rendered).to.equal(
        1,
        `Rendering for opensearch-chart with data-test-subj='${dataTestSubj}' was not finished in time`
      );
    }

    public async getVisualizationRenderingCount(dataTestSubj: string) {
      const chart = await testSubjects.find(dataTestSubj);
      const visContainer = await chart.findByCssSelector('.echChartStatus');
      const renderingCount = await visContainer.getAttribute('data-ech-render-count');
      return Number(renderingCount);
    }

    public async waitForRenderingCount(dataTestSubj: string, minimumCount: number) {
      await retry.waitFor(`rendering count to be equal to [${minimumCount}]`, async () => {
        const currentRenderingCount = await this.getVisualizationRenderingCount(dataTestSubj);
        log.debug(`-- currentRenderingCount=${currentRenderingCount}`);
        return currentRenderingCount >= minimumCount;
      });
    }
  }

  return new OpenSearchChart();
}
