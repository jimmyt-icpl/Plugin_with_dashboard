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

import schemaProvider from './schema';
import Joi from 'joi';

describe('Config schema', function () {
  let schema;
  beforeEach(async () => (schema = await schemaProvider()));

  function validate(data, options) {
    return Joi.validate(data, schema, options);
  }

  describe('server', function () {
    it('everything is optional', function () {
      const { error } = validate({});
      expect(error).toBe(null);
    });

    describe('basePath', function () {
      it('accepts empty strings', function () {
        const { error, value } = validate({ server: { basePath: '' } });
        expect(error).toBe(null);
        expect(value.server.basePath).toBe('');
      });

      it('accepts strings with leading slashes', function () {
        const { error, value } = validate({ server: { basePath: '/path' } });
        expect(error).toBe(null);
        expect(value.server.basePath).toBe('/path');
      });

      it('rejects strings with trailing slashes', function () {
        const { error } = validate({ server: { basePath: '/path/' } });
        expect(error).toHaveProperty('details');
        expect(error.details[0]).toHaveProperty('path', ['server', 'basePath']);
      });

      it('rejects strings without leading slashes', function () {
        const { error } = validate({ server: { basePath: 'path' } });
        expect(error).toHaveProperty('details');
        expect(error.details[0]).toHaveProperty('path', ['server', 'basePath']);
      });

      it('rejects things that are not strings', function () {
        for (const value of [1, true, {}, [], /foo/]) {
          const { error } = validate({ server: { basePath: value } });
          expect(error).toHaveProperty('details');
          expect(error.details[0]).toHaveProperty('path', ['server', 'basePath']);
        }
      });
    });

    describe('rewriteBasePath', function () {
      it('defaults to false', () => {
        const { error, value } = validate({});
        expect(error).toBe(null);
        expect(value.server.rewriteBasePath).toBe(false);
      });

      it('accepts false', function () {
        const { error, value } = validate({ server: { rewriteBasePath: false } });
        expect(error).toBe(null);
        expect(value.server.rewriteBasePath).toBe(false);
      });

      it('accepts true if basePath set', function () {
        const { error, value } = validate({ server: { basePath: '/foo', rewriteBasePath: true } });
        expect(error).toBe(null);
        expect(value.server.rewriteBasePath).toBe(true);
      });

      it('rejects true if basePath not set', function () {
        const { error } = validate({ server: { rewriteBasePath: true } });
        expect(error).toHaveProperty('details');
        expect(error.details[0]).toHaveProperty('path', ['server', 'rewriteBasePath']);
      });

      it('rejects strings', function () {
        const { error } = validate({ server: { rewriteBasePath: 'foo' } });
        expect(error).toHaveProperty('details');
        expect(error.details[0]).toHaveProperty('path', ['server', 'rewriteBasePath']);
      });
    });
  });
});
