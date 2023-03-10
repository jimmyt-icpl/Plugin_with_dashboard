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

import { EnvironmentService } from './environment';
import { MlCardState } from '../../types';

describe('EnvironmentService', () => {
  describe('setup', () => {
    test('allows multiple update calls', () => {
      const setup = new EnvironmentService().setup();
      expect(() => {
        setup.update({ ml: () => MlCardState.ENABLED });
      }).not.toThrow();
    });
  });

  describe('getEnvironment', () => {
    test('returns default values', () => {
      const service = new EnvironmentService();
      expect(service.getEnvironment().ml()).toEqual(MlCardState.DISABLED);
    });

    test('returns last state of update calls', () => {
      let cardState = MlCardState.DISABLED;
      const service = new EnvironmentService();
      const setup = service.setup();
      setup.update({ ml: () => cardState });
      expect(service.getEnvironment().ml()).toEqual(MlCardState.DISABLED);
      cardState = MlCardState.ENABLED;
      expect(service.getEnvironment().ml()).toEqual(MlCardState.ENABLED);
    });
  });
});
