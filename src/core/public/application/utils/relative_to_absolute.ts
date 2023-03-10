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

/**
 * Converts a relative path to an absolute url.
 * Implementation is based on a specified behavior of the browser to automatically convert
 * a relative url to an absolute one when setting the `href` attribute of a `<a>` html element.
 *
 * @example
 * ```ts
 * // current url: `https://opensearch-dashboards:8000/base-path/app/my-app`
 * relativeToAbsolute('/base-path/app/another-app') => `https://opensearch-dashboards:8000/base-path/app/another-app`
 * ```
 */
export const relativeToAbsolute = (url: string): string => {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  return a.href;
};
