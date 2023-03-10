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

import uuid from 'uuid';
import { config, HttpConfig } from './http_config';
import { CspConfig } from '../csp';

const validHostnames = ['www.example.com', '8.8.8.8', '::1', 'localhost'];
const invalidHostname = 'asdf$%^';

jest.mock('os', () => {
  const original = jest.requireActual('os');

  return {
    ...original,
    hostname: () => 'opensearch-dashboards-hostname',
  };
});

test('has defaults for config', () => {
  const httpSchema = config.schema;
  const obj = {};
  expect(httpSchema.validate(obj)).toMatchSnapshot();
});

test('accepts valid hostnames', () => {
  for (const val of validHostnames) {
    const { host } = config.schema.validate({ host: val });
    expect({ host }).toMatchSnapshot();
  }
});

test('throws if invalid hostname', () => {
  const httpSchema = config.schema;
  const obj = {
    host: invalidHostname,
  };
  expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
});

describe('requestId', () => {
  test('accepts valid ip addresses', () => {
    const {
      requestId: { ipAllowlist },
    } = config.schema.validate({
      requestId: {
        allowFromAnyIp: false,
        ipAllowlist: ['0.0.0.0', '123.123.123.123', '1200:0000:AB00:1234:0000:2552:7777:1313'],
      },
    });
    expect(ipAllowlist).toMatchInlineSnapshot(`
      Array [
        "0.0.0.0",
        "123.123.123.123",
        "1200:0000:AB00:1234:0000:2552:7777:1313",
      ]
    `);
  });

  test('rejects invalid ip addresses', () => {
    expect(() => {
      config.schema.validate({
        requestId: {
          allowFromAnyIp: false,
          ipAllowlist: ['1200:0000:AB00:1234:O000:2552:7777:1313', '[2001:db8:0:1]:80'],
        },
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"[requestId.ipAllowlist.0]: value must be a valid ipv4 or ipv6 address"`
    );
  });

  test('rejects if allowFromAnyIp is `true` and `ipAllowlist` is non-empty', () => {
    expect(() => {
      config.schema.validate({
        requestId: {
          allowFromAnyIp: true,
          ipAllowlist: ['0.0.0.0', '123.123.123.123', '1200:0000:AB00:1234:0000:2552:7777:1313'],
        },
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"[requestId]: allowFromAnyIp must be set to 'false' if any values are specified in ipAllowlist"`
    );

    expect(() => {
      config.schema.validate({
        requestId: {
          allowFromAnyIp: true,
          ipAllowlist: ['0.0.0.0', '123.123.123.123', '1200:0000:AB00:1234:0000:2552:7777:1313'],
        },
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"[requestId]: allowFromAnyIp must be set to 'false' if any values are specified in ipAllowlist"`
    );
  });
});

test('can specify max payload as string', () => {
  const obj = {
    maxPayload: '2mb',
  };
  const configValue = config.schema.validate(obj);
  expect(configValue.maxPayload.getValueInBytes()).toBe(2 * 1024 * 1024);
});

test('throws if basepath is missing prepended slash', () => {
  const httpSchema = config.schema;
  const obj = {
    basePath: 'foo',
  };
  expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
});

test('throws if basepath appends a slash', () => {
  const httpSchema = config.schema;
  const obj = {
    basePath: '/foo/',
  };
  expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
});

test('throws if basepath is an empty string', () => {
  const httpSchema = config.schema;
  const obj = {
    basePath: '',
  };
  expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
});

test('throws if basepath is not specified, but rewriteBasePath is set', () => {
  const httpSchema = config.schema;
  const obj = {
    rewriteBasePath: true,
  };
  expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
});

test('accepts only valid uuids for server.uuid', () => {
  const httpSchema = config.schema;
  expect(() => httpSchema.validate({ uuid: uuid.v4() })).not.toThrow();
  expect(() => httpSchema.validate({ uuid: 'not an uuid' })).toThrowErrorMatchingInlineSnapshot(
    `"[uuid]: must be a valid uuid"`
  );
});

test('uses os.hostname() as default for server.name', () => {
  const httpSchema = config.schema;
  const validated = httpSchema.validate({});
  expect(validated.name).toEqual('opensearch-dashboards-hostname');
});

test('throws if xsrf.whitelist element does not start with a slash', () => {
  const httpSchema = config.schema;
  const obj = {
    xsrf: {
      whitelist: ['/valid-path', 'invalid-path'],
    },
  };
  expect(() => httpSchema.validate(obj)).toThrowErrorMatchingInlineSnapshot(
    `"[xsrf.whitelist.1]: must start with a slash"`
  );
});

test('accepts any type of objects for custom headers', () => {
  const httpSchema = config.schema;
  const obj = {
    customResponseHeaders: {
      string: 'string',
      bool: true,
      number: 12,
      array: [1, 2, 3],
      nested: {
        foo: 1,
        bar: 'dolly',
      },
    },
  };
  expect(() => httpSchema.validate(obj)).not.toThrow();
});

describe('with TLS', () => {
  test('throws if TLS is enabled but `redirectHttpFromPort` is equal to `port`', () => {
    const httpSchema = config.schema;
    const obj = {
      port: 1234,
      ssl: {
        certificate: '/path/to/certificate',
        enabled: true,
        key: '/path/to/key',
        redirectHttpFromPort: 1234,
      },
    };
    expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
  });
});

test('can specify socket timeouts', () => {
  const obj = {
    keepaliveTimeout: 1e5,
    socketTimeout: 5e5,
  };
  const { keepaliveTimeout, socketTimeout } = config.schema.validate(obj);
  expect(keepaliveTimeout).toBe(1e5);
  expect(socketTimeout).toBe(5e5);
});

describe('with compression', () => {
  test('accepts valid referrer whitelist', () => {
    const {
      compression: { referrerWhitelist },
    } = config.schema.validate({
      compression: {
        referrerWhitelist: validHostnames,
      },
    });

    expect(referrerWhitelist).toMatchSnapshot();
  });

  test('throws if invalid referrer whitelist', () => {
    const httpSchema = config.schema;
    const invalidHostnames = {
      compression: {
        referrerWhitelist: [invalidHostname],
      },
    };
    const emptyArray = {
      compression: {
        referrerWhitelist: [],
      },
    };
    expect(() => httpSchema.validate(invalidHostnames)).toThrowErrorMatchingSnapshot();
    expect(() => httpSchema.validate(emptyArray)).toThrowErrorMatchingSnapshot();
  });

  test('throws if referrer whitelist is specified and compression is disabled', () => {
    const httpSchema = config.schema;
    const obj = {
      compression: {
        enabled: false,
        referrerWhitelist: validHostnames,
      },
    };
    expect(() => httpSchema.validate(obj)).toThrowErrorMatchingSnapshot();
  });
});

describe('HttpConfig', () => {
  it('converts customResponseHeaders to strings or arrays of strings', () => {
    const httpSchema = config.schema;
    const rawConfig = httpSchema.validate({
      customResponseHeaders: {
        string: 'string',
        bool: true,
        number: 12,
        array: [1, 2, 3],
        nested: {
          foo: 1,
          bar: 'dolly',
        },
      },
    });
    const httpConfig = new HttpConfig(rawConfig, CspConfig.DEFAULT);

    expect(httpConfig.customResponseHeaders).toEqual({
      string: 'string',
      bool: 'true',
      number: '12',
      array: ['1', '2', '3'],
      nested: '{"foo":1,"bar":"dolly"}',
    });
  });
});
