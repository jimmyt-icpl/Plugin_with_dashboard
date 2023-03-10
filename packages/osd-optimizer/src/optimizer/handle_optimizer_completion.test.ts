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

import * as Rx from 'rxjs';
import { REPO_ROOT } from '@osd/utils';

import { Update, allValuesFrom } from '../common';

import { OptimizerState } from './optimizer_state';
import { OptimizerConfig } from './optimizer_config';
import { handleOptimizerCompletion } from './handle_optimizer_completion';

const createUpdate$ = (phase: OptimizerState['phase']) =>
  Rx.of<Update<any, OptimizerState>>({
    state: {
      phase,
      compilerStates: [],
      durSec: 0,
      offlineBundles: [],
      onlineBundles: [],
      startTime: Date.now(),
    },
  });

const config = (watch?: boolean) =>
  OptimizerConfig.create({
    repoRoot: REPO_ROOT,
    watch,
  });

it('errors if the optimizer completes when in watch mode', async () => {
  const update$ = createUpdate$('success');

  await expect(
    allValuesFrom(update$.pipe(handleOptimizerCompletion(config(true))))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"optimizer unexpectedly completed when in watch mode"`
  );
});

it('errors if the optimizer completes in phase "issue"', async () => {
  const update$ = createUpdate$('issue');

  await expect(
    allValuesFrom(update$.pipe(handleOptimizerCompletion(config())))
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"webpack issue"`);
});

it('errors if the optimizer completes in phase "initializing"', async () => {
  const update$ = createUpdate$('initializing');

  await expect(
    allValuesFrom(update$.pipe(handleOptimizerCompletion(config())))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"optimizer unexpectedly exit in phase \\"initializing\\""`
  );
});

it('errors if the optimizer completes in phase "reallocating"', async () => {
  const update$ = createUpdate$('reallocating');

  await expect(
    allValuesFrom(update$.pipe(handleOptimizerCompletion(config())))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"optimizer unexpectedly exit in phase \\"reallocating\\""`
  );
});

it('errors if the optimizer completes in phase "running"', async () => {
  const update$ = createUpdate$('running');

  await expect(
    allValuesFrom(update$.pipe(handleOptimizerCompletion(config())))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"optimizer unexpectedly exit in phase \\"running\\""`
  );
});

it('passes through errors on the source stream', async () => {
  const error = new Error('foo');
  const update$ = Rx.throwError(error);

  await expect(
    allValuesFrom(update$.pipe(handleOptimizerCompletion(config())))
  ).rejects.toThrowError(error);
});
