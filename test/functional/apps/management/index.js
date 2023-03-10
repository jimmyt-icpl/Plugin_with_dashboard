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

export default function ({ getService, loadTestFile }) {
  const opensearchArchiver = getService('opensearchArchiver');

  describe('management', function () {
    before(async () => {
      await opensearchArchiver.unload('logstash_functional');
      await opensearchArchiver.load('empty_opensearch_dashboards');
      await opensearchArchiver.loadIfNeeded('makelogs');
    });

    after(async () => {
      await opensearchArchiver.unload('makelogs');
      await opensearchArchiver.unload('empty_opensearch_dashboards');
    });

    describe('', function () {
      this.tags('ciGroup7');

      loadTestFile(require.resolve('./_create_index_pattern_wizard'));
      loadTestFile(require.resolve('./_index_pattern_create_delete'));
      loadTestFile(require.resolve('./_index_pattern_results_sort'));
      loadTestFile(require.resolve('./_index_pattern_popularity'));
      loadTestFile(require.resolve('./_opensearch_dashboards_settings'));
      loadTestFile(require.resolve('./_scripted_fields'));
      loadTestFile(require.resolve('./_scripted_fields_preview'));
      loadTestFile(require.resolve('./_mgmt_import_saved_objects'));
      loadTestFile(require.resolve('./_index_patterns_empty'));
    });

    describe('', function () {
      this.tags('ciGroup8');

      loadTestFile(require.resolve('./_index_pattern_filter'));
      loadTestFile(require.resolve('./_scripted_fields_filter'));
      loadTestFile(require.resolve('./_import_objects'));
      loadTestFile(require.resolve('./_test_huge_fields'));
      loadTestFile(require.resolve('./_handle_alias'));
      loadTestFile(require.resolve('./_handle_version_conflict'));
    });
  });
}
