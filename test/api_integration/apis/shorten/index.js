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

export default function ({ getService }) {
  const opensearchArchiver = getService('opensearchArchiver');
  const supertest = getService('supertest');

  describe('url shortener', () => {
    before(() => opensearchArchiver.load('saved_objects/basic'));
    after(() => opensearchArchiver.unload('saved_objects/basic'));

    it('generates shortened urls', async () => {
      const resp = await supertest
        .post('/api/shorten_url')
        .set('content-type', 'application/json')
        .send({ url: '/app/visualize#/create' })
        .expect(200);

      expect(resp.body).to.have.property('urlId');
      expect(typeof resp.body.urlId).to.be('string');
      expect(resp.body.urlId.length > 0).to.be(true);
    });

    it('redirects shortened urls', async () => {
      const resp = await supertest
        .post('/api/shorten_url')
        .set('content-type', 'application/json')
        .send({ url: '/app/visualize#/create' });

      const urlId = resp.body.urlId;
      await supertest
        .get(`/goto/${urlId}`)
        .expect(302)
        .expect('location', '/app/visualize#/create');
    });
  });
}
