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

import series from '../../fixtures/mock_data/date_histogram/_series';
import terms from '../../fixtures/mock_data/terms/_columns';
import { TimeMarker } from './time_marker';

describe('Vislib Time Marker Test Suite', function () {
  const height = 50;
  const color = '#ff0000';
  const opacity = 0.5;
  const width = 3;
  const customClass = 'custom-time-marker';
  const dateMathTimes = ['now-1m', 'now-5m', 'now-15m'];
  const myTimes = dateMathTimes.map(function (dateMathString) {
    return {
      time: dateMathString,
      class: customClass,
      color: color,
      opacity: opacity,
      width: width,
    };
  });
  const getExtent = function (dataArray, func) {
    return func(dataArray, function (obj) {
      return func(obj.values, function (d) {
        return d.x;
      });
    });
  };
  const times = [];
  let defaultMarker;
  let customMarker;
  let selection;
  let xScale;
  let minDomain;
  let maxDomain;
  let domain;

  beforeEach(function () {
    minDomain = getExtent(series.series, d3.min);
    maxDomain = getExtent(series.series, d3.max);
    domain = [minDomain, maxDomain];
    xScale = d3.time.scale().domain(domain).range([0, 500]);
    defaultMarker = new TimeMarker(times, xScale, height);
    customMarker = new TimeMarker(myTimes, xScale, height);

    selection = d3.select('body').append('div').attr('class', 'marker');
    selection.datum(series);
  });

  afterEach(function () {
    selection.remove('*');
    selection = null;
    defaultMarker = null;
  });

  describe('_isTimeBaseChart method', function () {
    let boolean;
    let newSelection;

    it('should return true when data is time based', function () {
      boolean = defaultMarker._isTimeBasedChart(selection);
      expect(boolean).toBe(true);
    });

    it('should return false when data is not time based', function () {
      newSelection = selection.datum(terms);
      boolean = defaultMarker._isTimeBasedChart(newSelection);
      expect(boolean).toBe(false);
    });
  });

  describe('render method', function () {
    let lineArray;

    beforeEach(function () {
      defaultMarker.render(selection);
      customMarker.render(selection);
      lineArray = document.getElementsByClassName('custom-time-marker');
    });

    it('should render the default line', function () {
      expect(!!$('line.time-marker').length).toBe(true);
    });

    it('should render the custom (user defined) lines', function () {
      expect($('line.custom-time-marker').length).toBe(myTimes.length);
    });

    it('should set the class', function () {
      Array.prototype.forEach.call(lineArray, function (line) {
        expect(line.getAttribute('class')).toBe(customClass);
      });
    });

    it('should set the stroke', function () {
      Array.prototype.forEach.call(lineArray, function (line) {
        expect(line.getAttribute('stroke')).toBe(color);
      });
    });

    it('should set the stroke-opacity', function () {
      Array.prototype.forEach.call(lineArray, function (line) {
        expect(+line.getAttribute('stroke-opacity')).toBe(opacity);
      });
    });

    it('should set the stroke-width', function () {
      Array.prototype.forEach.call(lineArray, function (line) {
        expect(+line.getAttribute('stroke-width')).toBe(width);
      });
    });
  });
});
