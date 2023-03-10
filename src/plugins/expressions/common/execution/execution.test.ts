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

import { Execution } from './execution';
import { parseExpression, ExpressionAstExpression } from '../ast';
import { createUnitTestExecutor } from '../test_helpers';
import { ExpressionFunctionDefinition } from '../../common';
import { ExecutionContract } from './execution_contract';

beforeAll(() => {
  if (typeof performance === 'undefined') {
    (global as any).performance = { now: Date.now };
  }
});

const createExecution = (
  expression: string = 'foo bar=123',
  context: Record<string, unknown> = {},
  debug: boolean = false
) => {
  const executor = createUnitTestExecutor();
  const execution = new Execution({
    executor,
    ast: parseExpression(expression),
    context,
    debug,
  });
  return execution;
};

const run = async (
  expression: string = 'foo bar=123',
  context?: Record<string, unknown>,
  input: any = null
) => {
  const execution = createExecution(expression, context);
  execution.start(input);
  return await execution.result;
};

describe('Execution', () => {
  test('can instantiate', () => {
    const execution = createExecution('foo bar=123');
    expect(execution.state.get().ast.chain[0].arguments.bar).toEqual([123]);
  });

  test('initial input is null at creation', () => {
    const execution = createExecution();
    expect(execution.input).toBe(null);
  });

  test('creates default ExecutionContext', () => {
    const execution = createExecution();
    expect(execution.context).toMatchObject({
      getInitialInput: expect.any(Function),
      variables: expect.any(Object),
      types: expect.any(Object),
    });
  });

  test('executes a single clog function in expression pipeline', async () => {
    const execution = createExecution('clog');
    /* eslint-disable no-console */
    const console$log = console.log;
    const spy = (console.log = jest.fn());
    /* eslint-enable no-console */

    execution.start(123);
    const result = await execution.result;

    expect(result).toBe(123);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(123);

    /* eslint-disable no-console */
    console.log = console$log;
    /* eslint-enable no-console */
  });

  test('executes a chain of multiple "add" functions', async () => {
    const execution = createExecution('add val=1 | add val=2 | add val=3');
    execution.start({
      type: 'num',
      value: -1,
    });

    const result = await execution.result;

    expect(result).toEqual({
      type: 'num',
      value: 5,
    });
  });

  test('executes a chain of "add" and "mult" functions', async () => {
    const execution = createExecution('add val=5 | mult val=-1 | add val=-10 | mult val=2');
    execution.start({
      type: 'num',
      value: 0,
    });

    const result = await execution.result;

    expect(result).toEqual({
      type: 'num',
      value: -30,
    });
  });

  test('casts input to correct type', async () => {
    const execution = createExecution('add val=1');

    // Below 1 is cast to { type: 'num', value: 1 }.
    execution.start(1);
    const result = await execution.result;

    expect(result).toEqual({
      type: 'num',
      value: 2,
    });
  });

  describe('.expression', () => {
    test('uses expression passed in to constructor', () => {
      const expression = 'add val="1"';
      const executor = createUnitTestExecutor();
      const execution = new Execution({
        executor,
        expression,
      });
      expect(execution.expression).toBe(expression);
    });

    test('generates expression from AST if not passed to constructor', () => {
      const expression = 'add val="1"';
      const executor = createUnitTestExecutor();
      const execution = new Execution({
        ast: parseExpression(expression),
        executor,
      });
      expect(execution.expression).toBe(expression);
    });
  });

  describe('.contract', () => {
    test('is instance of ExecutionContract', () => {
      const execution = createExecution('add val=1');
      expect(execution.contract).toBeInstanceOf(ExecutionContract);
    });

    test('execution returns the same expression string', () => {
      const execution = createExecution('add val=1');
      expect(execution.expression).toBe(execution.contract.getExpression());
    });
  });

  describe('execution context', () => {
    test('context.variables is an object', async () => {
      const { result } = (await run('introspectContext key="variables"')) as any;
      expect(typeof result).toBe('object');
    });

    test('context.types is an object', async () => {
      const { result } = (await run('introspectContext key="types"')) as any;
      expect(typeof result).toBe('object');
    });

    test('context.abortSignal is an object', async () => {
      const { result } = (await run('introspectContext key="abortSignal"')) as any;
      expect(typeof result).toBe('object');
    });

    test('context.inspectorAdapters is an object', async () => {
      const { result } = (await run('introspectContext key="inspectorAdapters"')) as any;
      expect(typeof result).toBe('object');
    });

    test('unknown context key is undefined', async () => {
      const { result } = (await run('introspectContext key="foo"')) as any;
      expect(typeof result).toBe('undefined');
    });

    test('can set context variables', async () => {
      const variables = { foo: 'bar' };
      const result = await run('var name="foo"', { variables });
      expect(result).toBe('bar');
    });
  });

  describe('inspector adapters', () => {
    test('by default, "data" and "requests" inspector adapters are available', async () => {
      const { result } = (await run('introspectContext key="inspectorAdapters"')) as any;
      expect(result).toMatchObject({
        data: expect.any(Object),
        requests: expect.any(Object),
      });
    });

    test('can set custom inspector adapters', async () => {
      const inspectorAdapters = {};
      const { result } = (await run('introspectContext key="inspectorAdapters"', {
        inspectorAdapters,
      })) as any;
      expect(result).toBe(inspectorAdapters);
    });

    test('can access custom inspector adapters on Execution object', async () => {
      const inspectorAdapters = {};
      const execution = createExecution('introspectContext key="inspectorAdapters"', {
        inspectorAdapters,
      });
      expect(execution.inspectorAdapters).toBe(inspectorAdapters);
    });
  });

  describe('expression abortion', () => {
    test('context has abortSignal object', async () => {
      const { result } = (await run('introspectContext key="abortSignal"')) as any;

      expect(typeof result).toBe('object');
      expect((result as AbortSignal).aborted).toBe(false);
    });
  });

  describe('expression execution', () => {
    test('supports default argument alias _', async () => {
      const execution = createExecution('add val=1 | add 2');
      execution.start({
        type: 'num',
        value: 0,
      });

      const result = await execution.result;

      expect(result).toEqual({
        type: 'num',
        value: 3,
      });
    });

    test('can execute async functions', async () => {
      const res = await run('sleep 10 | sleep 10');
      expect(res).toBe(null);
    });

    test('result is undefined until execution completes', async () => {
      const execution = createExecution('sleep 10');
      expect(execution.state.get().result).toBe(undefined);
      execution.start(null);
      expect(execution.state.get().result).toBe(undefined);
      await new Promise((r) => setTimeout(r, 1));
      expect(execution.state.get().result).toBe(undefined);
      await new Promise((r) => setTimeout(r, 11));
      expect(execution.state.get().result).toBe(null);
    });
  });

  describe('when function throws', () => {
    test('error is reported in output object', async () => {
      const result = await run('error "foobar"');

      expect(result).toMatchObject({
        type: 'error',
      });
    });

    test('error message is prefixed with function name', async () => {
      const result = await run('error "foobar"');

      expect(result).toMatchObject({
        error: {
          message: `[error] > foobar`,
        },
      });
    });

    test('returns error of the first function that throws', async () => {
      const result = await run('error "foo" | error "bar"');

      expect(result).toMatchObject({
        error: {
          message: `[error] > foo`,
        },
      });
    });

    test('when function throws, execution still succeeds', async () => {
      const execution = await createExecution('error "foo"');
      execution.start(null);

      const result = await execution.result;

      expect(result).toMatchObject({
        type: 'error',
      });
      expect(execution.state.get().state).toBe('result');
      expect(execution.state.get().result).toMatchObject({
        type: 'error',
      });
    });

    test('does not execute remaining functions in pipeline', async () => {
      const spy: ExpressionFunctionDefinition<'spy', any, {}, any> = {
        name: 'spy',
        args: {},
        help: '',
        fn: jest.fn(),
      };
      const executor = createUnitTestExecutor();
      executor.registerFunction(spy);

      await executor.run('error "..." | spy', null);

      expect(spy.fn).toHaveBeenCalledTimes(0);
    });
  });

  describe('state', () => {
    test('execution state is "not-started" before .start() is called', async () => {
      const execution = createExecution('var foo');
      expect(execution.state.get().state).toBe('not-started');
    });

    test('execution state is "pending" after .start() was called', async () => {
      const execution = createExecution('var foo');
      execution.start(null);
      expect(execution.state.get().state).toBe('pending');
    });

    test('execution state is "pending" while execution is in progress', async () => {
      jest.useFakeTimers();
      const execution = createExecution('sleep 20');
      execution.start(null);
      jest.advanceTimersByTime(5);
      expect(execution.state.get().state).toBe('pending');
      jest.useRealTimers();
    });

    test('execution state is "result" when execution successfully completes', async () => {
      const execution = createExecution('sleep 1');
      execution.start(null);
      await execution.result;
      expect(execution.state.get().state).toBe('result');
    });

    test('execution state is "result" when execution successfully completes - 2', async () => {
      const execution = createExecution('var foo');
      execution.start(null);
      await execution.result;
      expect(execution.state.get().state).toBe('result');
    });
  });

  describe('sub-expressions', () => {
    test('executes sub-expressions', async () => {
      const result = await run('add val={add 5 | access "value"}', {}, null);

      expect(result).toMatchObject({
        type: 'num',
        value: 5,
      });
    });

    test('can use global variables', async () => {
      const result = await run(
        'add val={var foo}',
        {
          variables: {
            foo: 3,
          },
        },
        null
      );

      expect(result).toMatchObject({
        type: 'num',
        value: 3,
      });
    });

    test('can modify global variables', async () => {
      const result = await run(
        'add val={var_set name=foo value=66 | var bar} | var foo',
        {
          variables: {
            foo: 3,
            bar: 25,
          },
        },
        null
      );

      expect(result).toBe(66);
    });
  });

  describe('when arguments are missing', () => {
    test('when required argument is missing and has not alias, returns error', async () => {
      const requiredArg: ExpressionFunctionDefinition<'requiredArg', any, { arg: any }, any> = {
        name: 'requiredArg',
        args: {
          arg: {
            help: '',
            required: true,
          },
        },
        help: '',
        fn: jest.fn(),
      };
      const executor = createUnitTestExecutor();
      executor.registerFunction(requiredArg);
      const result = await executor.run('requiredArg', null, {});

      expect(result).toMatchObject({
        type: 'error',
        error: {
          message: '[requiredArg] > requiredArg requires an argument',
        },
      });
    });

    test('when required argument is missing and has alias, returns error', async () => {
      const result = await run('var_set', {});

      expect(result).toMatchObject({
        type: 'error',
        error: {
          message: '[var_set] > var_set requires an "name" argument',
        },
      });
    });
  });

  describe('debug mode', () => {
    test('can execute expression in debug mode', async () => {
      const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
      execution.start(-1);
      const result = await execution.result;

      expect(result).toEqual({
        type: 'num',
        value: 5,
      });
    });

    test('can execute expression with sub-expression in debug mode', async () => {
      const execution = createExecution(
        'add val={var_set name=foo value=5 | var name=foo} | add val=10',
        {},
        true
      );
      execution.start(0);
      const result = await execution.result;

      expect(result).toEqual({
        type: 'num',
        value: 15,
      });
    });

    describe('when functions succeed', () => {
      test('sets "success" flag on all functions to true', async () => {
        const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
        execution.start(-1);
        await execution.result;

        for (const node of execution.state.get().ast.chain) {
          expect(node.debug?.success).toBe(true);
        }
      });

      test('stores "fn" reference to the function', async () => {
        const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
        execution.start(-1);
        await execution.result;

        for (const node of execution.state.get().ast.chain) {
          expect(node.debug?.fn).toBe('add');
        }
      });

      test('saves duration it took to execute each function', async () => {
        const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
        execution.start(-1);
        await execution.result;

        for (const node of execution.state.get().ast.chain) {
          expect(typeof node.debug?.duration).toBe('number');
          expect(node.debug?.duration).toBeLessThan(100);
          expect(node.debug?.duration).toBeGreaterThanOrEqual(0);
        }
      });

      test('adds .debug field in expression AST on each executed function', async () => {
        const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
        execution.start(-1);
        await execution.result;

        for (const node of execution.state.get().ast.chain) {
          expect(typeof node.debug).toBe('object');
          expect(!!node.debug).toBe(true);
        }
      });

      test('stores input of each function', async () => {
        const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
        execution.start(-1);
        await execution.result;

        const { chain } = execution.state.get().ast;

        expect(chain[0].debug!.input).toBe(-1);
        expect(chain[1].debug!.input).toEqual({
          type: 'num',
          value: 0,
        });
        expect(chain[2].debug!.input).toEqual({
          type: 'num',
          value: 2,
        });
      });

      test('stores output of each function', async () => {
        const execution = createExecution('add val=1 | add val=2 | add val=3', {}, true);
        execution.start(-1);
        await execution.result;

        const { chain } = execution.state.get().ast;

        expect(chain[0].debug!.output).toEqual({
          type: 'num',
          value: 0,
        });
        expect(chain[1].debug!.output).toEqual({
          type: 'num',
          value: 2,
        });
        expect(chain[2].debug!.output).toEqual({
          type: 'num',
          value: 5,
        });
      });

      test('stores resolved arguments of a function', async () => {
        const execution = createExecution(
          'add val={var_set name=foo value=5 | var name=foo} | add val=10',
          {},
          true
        );
        execution.start(-1);
        await execution.result;

        const { chain } = execution.state.get().ast;

        expect(chain[0].debug!.args).toEqual({
          val: 5,
        });

        expect((chain[0].arguments.val[0] as ExpressionAstExpression).chain[0].debug!.args).toEqual(
          {
            name: 'foo',
            value: 5,
          }
        );
      });

      test('store debug information about sub-expressions', async () => {
        const execution = createExecution(
          'add val={var_set name=foo value=5 | var name=foo} | add val=10',
          {},
          true
        );
        execution.start(0);
        await execution.result;

        const { chain } = execution.state.get().ast.chain[0].arguments
          .val[0] as ExpressionAstExpression;

        expect(typeof chain[0].debug).toBe('object');
        expect(typeof chain[1].debug).toBe('object');
        expect(!!chain[0].debug).toBe(true);
        expect(!!chain[1].debug).toBe(true);

        expect(chain[0].debug!.input).toBe(0);
        expect(chain[0].debug!.output).toBe(0);
        expect(chain[1].debug!.input).toBe(0);
        expect(chain[1].debug!.output).toBe(5);
      });
    });

    describe('when expression throws', () => {
      const executor = createUnitTestExecutor();
      executor.registerFunction({
        name: 'throws',
        args: {},
        help: '',
        fn: () => {
          throw new Error('foo');
        },
      });

      test('stores debug information up until the function that throws', async () => {
        const execution = new Execution({
          executor,
          ast: parseExpression('add val=1 | throws | add val=3'),
          debug: true,
        });
        execution.start(0);
        await execution.result;

        const node1 = execution.state.get().ast.chain[0];
        const node2 = execution.state.get().ast.chain[1];
        const node3 = execution.state.get().ast.chain[2];

        expect(typeof node1.debug).toBe('object');
        expect(typeof node2.debug).toBe('object');
        expect(typeof node3.debug).toBe('undefined');
      });

      test('stores error thrown in debug information', async () => {
        const execution = new Execution({
          executor,
          ast: parseExpression('add val=1 | throws | add val=3'),
          debug: true,
        });
        execution.start(0);
        await execution.result;

        const node2 = execution.state.get().ast.chain[1];

        expect(node2.debug?.error).toMatchObject({
          type: 'error',
          error: {
            message: '[throws] > foo',
          },
        });
        expect(node2.debug?.rawError).toBeInstanceOf(Error);
        expect(node2.debug?.rawError).toEqual(new Error('foo'));
      });

      test('sets .debug object to expected shape', async () => {
        const execution = new Execution({
          executor,
          ast: parseExpression('add val=1 | throws | add val=3'),
          debug: true,
        });
        execution.start(0);
        await execution.result;

        const node2 = execution.state.get().ast.chain[1];

        expect(node2.debug).toMatchObject({
          success: false,
          fn: 'throws',
          input: expect.any(Object),
          args: expect.any(Object),
          error: expect.any(Object),
          rawError: expect.any(Error),
          duration: expect.any(Number),
        });
      });
    });
  });
});
