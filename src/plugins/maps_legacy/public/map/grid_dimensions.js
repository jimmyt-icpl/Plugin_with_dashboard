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

// geohash precision mapping of geohash grid cell dimensions (width x height, in meters) at equator.
// https://opensearch.org/docs/latest/opensearch/bucket-agg/#geo_distance-geohash_grid
const gridAtEquator = {
  1: [5009400, 4992600],
  2: [1252300, 624100],
  3: [156500, 156000],
  4: [39100, 19500],
  5: [4900, 4900],
  6: [1200, 609.4],
  7: [152.9, 152.4],
  8: [38.2, 19],
  9: [4.8, 4.8],
  10: [1.2, 0.595],
  11: [0.149, 0.149],
  12: [0.037, 0.019],
};

export function gridDimensions(precision) {
  return gridAtEquator[precision];
}
