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

const assertStatsAndMetrics = (body) => {
  expect(body.opensearchDashboards.name).to.be.a('string');
  expect(body.opensearchDashboards.uuid).to.be.a('string');
  expect(body.opensearchDashboards.host).to.be.a('string');
  expect(body.opensearchDashboards.transport_address).to.be.a('string');
  expect(body.opensearchDashboards.version).to.be.a('string');
  expect(body.opensearchDashboards.snapshot).to.be.a('boolean');
  expect(body.opensearchDashboards.status).to.be('green');

  expect(body.process.memory.heap.total_bytes).to.be.a('number');
  expect(body.process.memory.heap.used_bytes).to.be.a('number');
  expect(body.process.memory.heap.size_limit).to.be.a('number');
  expect(body.process.memory.resident_set_size_bytes).to.be.a('number');
  expect(body.process.pid).to.be.a('number');
  expect(body.process.uptime_ms).to.be.a('number');
  expect(body.process.event_loop_delay).to.be.a('number');

  expect(body.os.memory.free_bytes).to.be.a('number');
  expect(body.os.memory.total_bytes).to.be.a('number');
  expect(body.os.uptime_ms).to.be.a('number');

  expect(body.os.load['1m']).to.be.a('number');
  expect(body.os.load['5m']).to.be.a('number');
  expect(body.os.load['15m']).to.be.a('number');

  expect(body.response_times.avg_ms).not.to.be(null); // ok if is undefined
  expect(body.response_times.max_ms).not.to.be(null); // ok if is undefined

  expect(body.requests.total).to.be.a('number');
  expect(body.requests.disconnects).to.be.a('number');

  expect(body.concurrent_connections).to.be.a('number');
};

export default function ({ getService }) {
  const supertest = getService('supertest');
  const opensearchArchiver = getService('opensearchArchiver');

  describe('opensearch-dashboards stats api', () => {
    before('make sure there are some saved objects', () =>
      opensearchArchiver.load('saved_objects/basic')
    );
    after('cleanup saved objects changes', () => opensearchArchiver.unload('saved_objects/basic'));

    describe('basic', () => {
      it('should return the stats without cluster_uuid with no query string params', () => {
        return supertest
          .get('/api/stats')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(({ body }) => {
            expect(body.cluster_uuid).to.be(undefined);
            assertStatsAndMetrics(body);
          });
      });
      it(`should return the stats without cluster_uuid with 'extended' query string param = false`, () => {
        return supertest
          .get('/api/stats?extended=false')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(({ body }) => {
            expect(body.cluster_uuid).to.be(undefined);
            assertStatsAndMetrics(body);
          });
      });
    });

    // TODO load an opensearch archive and verify the counts in saved object usage info
    describe('extended', () => {
      it(`should return the stats, cluster_uuid, and usage with 'extended' query string param present`, () => {
        return supertest
          .get('/api/stats?extended')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(({ body }) => {
            expect(body.cluster_uuid).to.be.a('string');
            expect(body.usage).to.be.an('object'); // no usage collectors have been registered so usage is an empty object
            assertStatsAndMetrics(body);
          });
      });

      it(`should return the stats, cluster_uuid, and usage with 'extended' query string param = true`, () => {
        return supertest
          .get('/api/stats?extended=true')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(({ body }) => {
            expect(body.cluster_uuid).to.be.a('string');
            expect(body.usage).to.be.an('object');
            assertStatsAndMetrics(body);
          });
      });

      describe('legacy', () => {
        it(`should return return the 'extended' data in the old format with 'legacy' query string param present`, () => {
          return supertest
            .get('/api/stats?extended&legacy')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(({ body }) => {
              expect(body.clusterUuid).to.be.a('string');
              expect(body.usage).to.be.an('object'); // no usage collectors have been registered so usage is an empty object
              assertStatsAndMetrics(body, true);
            });
        });
      });

      describe('exclude usage', () => {
        it('should include an empty usage object from the API response', () => {
          return supertest
            .get('/api/stats?extended&exclude_usage')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.property('usage');
              expect(body.usage).to.eql({});
            });
        });

        it('should include an empty usage object from the API response if `legacy` is provided', () => {
          return supertest
            .get('/api/stats?extended&exclude_usage&legacy')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.property('usage');
              expect(body.usage).to.eql({});
            });
        });
      });
    });
  });
}
