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

import * as osdTestServer from '../../../test_helpers/osd_server';

describe('legacy service', () => {
  describe('http server', () => {
    let root: ReturnType<typeof osdTestServer.createRoot>;
    beforeEach(() => {
      root = osdTestServer.createRoot({
        migrations: { skip: true },
        plugins: { initialize: false },
      });
    }, 30000);

    afterEach(async () => await root.shutdown());

    it("handles http request in Legacy platform if New platform doesn't handle it", async () => {
      const { http } = await root.setup();
      const rootUrl = '/route';
      const router = http.createRouter(rootUrl);
      router.get({ path: '/new-platform', validate: false }, (context, req, res) =>
        res.ok({ body: 'from-new-platform' })
      );

      await root.start();

      const legacyPlatformUrl = `${rootUrl}/legacy-platform`;
      const osdServer = osdTestServer.getOsdServer(root);
      osdServer.server.route({
        method: 'GET',
        path: legacyPlatformUrl,
        handler: () => 'ok from legacy server',
      });

      await osdTestServer.request.get(root, '/route/new-platform').expect(200, 'from-new-platform');

      await osdTestServer.request.get(root, legacyPlatformUrl).expect(200, 'ok from legacy server');
    });
    it('throws error if Legacy and New platforms register handler for the same route', async () => {
      const { http } = await root.setup();
      const rootUrl = '/route';
      const router = http.createRouter(rootUrl);
      router.get({ path: '', validate: false }, (context, req, res) =>
        res.ok({ body: 'from-new-platform' })
      );

      await root.start();

      const osdServer = osdTestServer.getOsdServer(root);
      expect(() =>
        osdServer.server.route({
          method: 'GET',
          path: rootUrl,
          handler: () => 'ok from legacy server',
        })
      ).toThrowErrorMatchingInlineSnapshot(`"New route /route conflicts with existing /route"`);
    });
  });
});
