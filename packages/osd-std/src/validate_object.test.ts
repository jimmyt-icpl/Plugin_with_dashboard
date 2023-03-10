/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateObject } from './validate_object';

test(`fails on circular references`, () => {
  const foo: Record<string, any> = {};
  foo.myself = foo;

  expect(() =>
    validateObject({
      payload: foo,
    })
  ).toThrowErrorMatchingInlineSnapshot(`"circular reference detected"`);
});

[
  {
    foo: true,
    bar: '__proto__',
    baz: 1.1,
    qux: undefined,
    quux: () => null,
    quuz: Object.create(null),
  },
  {
    foo: {
      foo: true,
      bar: '__proto__',
      baz: 1.1,
      qux: undefined,
      quux: () => null,
      quuz: Object.create(null),
    },
  },
  { constructor: { foo: { prototype: null } } },
  { prototype: { foo: { constructor: null } } },
].forEach((value) => {
  ['headers', 'payload', 'query', 'params'].forEach((property) => {
    const obj = {
      [property]: value,
    };
    test(`can submit ${JSON.stringify(obj)}`, () => {
      expect(() => validateObject(obj)).not.toThrowError();
    });
  });
});

// if we use the object literal syntax to create the following values, we end up
// actually reassigning the __proto__ which makes it be a non-enumerable not-own property
// which isn't what we want to test here
[
  JSON.parse(`{ "__proto__": null }`),
  JSON.parse(`{ "foo": { "__proto__": true } }`),
  JSON.parse(`{ "foo": { "bar": { "__proto__": {} } } }`),
  JSON.parse(`{ "constructor": { "prototype" : null } }`),
  JSON.parse(`{ "foo": { "constructor": { "prototype" : null } } }`),
  JSON.parse(`{ "foo": { "bar": { "constructor": { "prototype" : null } } } }`),
].forEach((value) => {
  test(`can't submit ${JSON.stringify(value)}`, () => {
    expect(() => validateObject(value)).toThrowErrorMatchingSnapshot();
  });
});
