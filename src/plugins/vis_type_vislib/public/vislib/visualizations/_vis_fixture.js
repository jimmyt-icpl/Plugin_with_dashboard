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

import _ from 'lodash';
import $ from 'jquery';
import { coreMock } from '../../../../../core/public/mocks';
import { chartPluginMock } from '../../../../charts/public/mocks';

import { Vis } from '../vis';

const $visCanvas = $('<div>')
  .attr('id', 'vislib-vis-fixtures')
  .css({
    height: '500px',
    width: '1024px',
    display: 'flex',
    position: 'fixed',
    top: '0px',
    left: '0px',
    overflow: 'hidden',
    'pointer-events': 'none', // Prevent element from blocking you from clicking a test
  })
  .appendTo('body');

let count = 0;
const visHeight = $visCanvas.height();

$visCanvas.new = function () {
  count += 1;
  if (count > 1) $visCanvas.height(visHeight * count);
  return $('<div>').addClass('visChart').appendTo($visCanvas);
};

afterEach(function () {
  $visCanvas.empty();
  if (count > 1) $visCanvas.height(visHeight);
  count = 0;
});

const getDeps = () => {
  const mockUiSettings = coreMock.createSetup().uiSettings;
  const charts = chartPluginMock.createStartContract();

  return {
    uiSettings: mockUiSettings,
    charts: charts,
  };
};

export function getVis(visLibParams, element) {
  return new Vis(
    element || $visCanvas.new(),
    _.defaults({}, visLibParams || {}, {
      addTooltip: true,
      addLegend: true,
      defaultYExtents: false,
      setYExtents: false,
      yAxis: {},
      type: 'histogram',
    }),
    getDeps()
  );
}
