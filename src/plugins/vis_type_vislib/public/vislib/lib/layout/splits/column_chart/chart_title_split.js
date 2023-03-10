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

import d3 from 'd3';
import $ from 'jquery';

/*
 * Adds div DOM elements to either the `.visAxis__splitTitles--y` element or the
 * `.visAxis__splitTitles--x` element based on the data layout.
 * For example, if the data has rows, it returns the same number of
 * `.chart-title` elements as row objects.
 * if not data.rows or data.columns, return no chart titles
 */
export function chartTitleSplit(selection) {
  selection.each(function (data) {
    const div = d3.select(this);
    const parent = $(this).parents('.visWrapper');

    if (!data.series) {
      div
        .selectAll('.chart-title')
        .data(function (d) {
          return d.rows ? d.rows : d.columns;
        })
        .enter()
        .append('div')
        .attr('class', 'chart-title');

      if (data.rows) {
        parent.find('.visAxis__splitTitles--x').remove();
      } else {
        parent.find('.visAxis__splitTitles--y').remove();
      }

      return div;
    }

    return d3.select(this).remove();
  });
}
