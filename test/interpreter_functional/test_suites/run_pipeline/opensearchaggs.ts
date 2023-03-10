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
import { ExpectExpression, expectExpressionProvider } from './helpers';
import { FtrProviderContext } from '../../../functional/ftr_provider_context';

function getCell(opensearchaggsResult: any, column: number, row: number): unknown | undefined {
  const columnId = opensearchaggsResult?.columns[column]?.id;
  if (!columnId) {
    return;
  }
  return opensearchaggsResult?.rows[row]?.[columnId];
}

export default function ({
  getService,
  updateBaselines,
}: FtrProviderContext & { updateBaselines: boolean }) {
  let expectExpression: ExpectExpression;
  describe('opensearchaggs pipeline expression tests', () => {
    before(() => {
      expectExpression = expectExpressionProvider({ getService, updateBaselines });
    });

    describe('correctly renders tagcloud', () => {
      it('filters on index pattern primary date field by default', async () => {
        const aggConfigs = [{ id: 1, enabled: true, type: 'count', schema: 'metric', params: {} }];
        const timeRange = {
          from: '2006-09-21T00:00:00Z',
          to: '2015-09-22T00:00:00Z',
        };
        const expression = `
          opensearch_dashboards_context timeRange='${JSON.stringify(timeRange)}'
          | opensearchaggs index='logstash-*' aggConfigs='${JSON.stringify(aggConfigs)}'
        `;
        const result = await expectExpression(
          'opensearchaggs_primary_timefield',
          expression
        ).getResponse();
        expect(getCell(result, 0, 0)).to.be(9375);
      });

      it('filters on the specified date field', async () => {
        const aggConfigs = [{ id: 1, enabled: true, type: 'count', schema: 'metric', params: {} }];
        const timeRange = {
          from: '2006-09-21T00:00:00Z',
          to: '2015-09-22T00:00:00Z',
        };
        const expression = `
          opensearch_dashboards_context timeRange='${JSON.stringify(timeRange)}'
          | opensearchaggs index='logstash-*' timeFields='relatedContent.article:published_time' aggConfigs='${JSON.stringify(
            aggConfigs
          )}'
        `;
        const result = await expectExpression(
          'opensearchaggs_other_timefield',
          expression
        ).getResponse();
        expect(getCell(result, 0, 0)).to.be(11134);
      });

      it('filters on multiple specified date field', async () => {
        const aggConfigs = [{ id: 1, enabled: true, type: 'count', schema: 'metric', params: {} }];
        const timeRange = {
          from: '2006-09-21T00:00:00Z',
          to: '2015-09-22T00:00:00Z',
        };
        const expression = `
          opensearch_dashboards_context timeRange='${JSON.stringify(timeRange)}'
          | opensearchaggs index='logstash-*' timeFields='relatedContent.article:published_time' timeFields='@timestamp' aggConfigs='${JSON.stringify(
            aggConfigs
          )}'
        `;
        const result = await expectExpression(
          'opensearchaggs_multiple_timefields',
          expression
        ).getResponse();
        expect(getCell(result, 0, 0)).to.be(7452);
      });
    });
  });
}
