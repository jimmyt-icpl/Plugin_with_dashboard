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

import {
  ManagementSectionsService,
  getSectionsServiceStartPrivate,
} from './management_sections_service';

describe('ManagementService', () => {
  let managementService: ManagementSectionsService;

  beforeEach(() => {
    managementService = new ManagementSectionsService();
  });

  const capabilities = {
    navLinks: {},
    catalogue: {},
    management: {},
  };

  test('Provides default sections', () => {
    managementService.setup();
    managementService.start({ capabilities });
    const start = getSectionsServiceStartPrivate();

    expect(start.getSectionsEnabled().length).toEqual(6);
  });

  test('Register section, enable and disable', () => {
    // Setup phase:
    const setup = managementService.setup();
    const testSection = setup.register({ id: 'test-section', title: 'Test Section' });

    expect(testSection).not.toBeUndefined();

    // Start phase:
    managementService.start({ capabilities });
    const start = getSectionsServiceStartPrivate();

    expect(start.getSectionsEnabled().length).toEqual(7);

    testSection.disable();

    expect(start.getSectionsEnabled().length).toEqual(6);
  });

  test('Disables items that are not allowed by Capabilities', () => {
    // Setup phase:
    const setup = managementService.setup();
    const testSection = setup.register({ id: 'test-section', title: 'Test Section' });
    testSection.registerApp({ id: 'test-app-1', title: 'Test App 1', mount: jest.fn() });
    testSection.registerApp({ id: 'test-app-2', title: 'Test App 2', mount: jest.fn() });
    testSection.registerApp({ id: 'test-app-3', title: 'Test App 3', mount: jest.fn() });

    expect(testSection).not.toBeUndefined();

    // Start phase:
    managementService.start({
      capabilities: {
        navLinks: {},
        catalogue: {},
        management: {
          ['test-section']: {
            'test-app-1': true,
            'test-app-2': false,
            // test-app-3 intentionally left undefined. Should be enabled by default
          },
        },
      },
    });

    expect(testSection.apps).toHaveLength(3);
    expect(testSection.getAppsEnabled().map((app) => app.id)).toMatchInlineSnapshot(`
      Array [
        "test-app-1",
        "test-app-3",
      ]
    `);
  });
});
