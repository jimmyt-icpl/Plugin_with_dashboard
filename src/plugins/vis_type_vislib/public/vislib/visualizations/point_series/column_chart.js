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
import d3 from 'd3';
import { isColorDark } from '@elastic/eui/lib/services';
import { PointSeries } from './_point_series';

const defaults = {
  mode: 'normal',
  showTooltip: true,
  color: undefined,
  fillColor: undefined,
  showLabel: true,
};

/**
 * Histogram intervals are not always equal widths, e.g, monthly time intervals.
 * It is more visually appealing to vary bar width so that gutter width is constant.
 */
function datumWidth(defaultWidth, datum, nextDatum, scale, gutterWidth, groupCount = 1) {
  let datumWidth = defaultWidth;
  if (nextDatum) {
    datumWidth = (scale(nextDatum.x) - scale(datum.x) - gutterWidth) / groupCount;
    // To handle data-sets with holes, do not let width be larger than default.
    if (datumWidth > defaultWidth) {
      datumWidth = defaultWidth;
    }
  }
  return datumWidth;
}

/**
 * Vertical Bar Chart Visualization: renders vertical and/or stacked bars
 *
 * @class ColumnChart
 * @constructor
 * @extends Chart
 * @param handler {Object} Reference to the Handler Class Constructor
 * @param el {HTMLElement} HTML element to which the chart will be appended
 * @param chartData {Object} Elasticsearch query results for this specific chart
 */
export class ColumnChart extends PointSeries {
  constructor(handler, chartEl, chartData, seriesConfigArgs, deps) {
    super(handler, chartEl, chartData, seriesConfigArgs, deps);
    this.seriesConfig = _.defaults(seriesConfigArgs || {}, defaults);
    this.labelOptions = _.defaults(handler.visConfig.get('labels', {}), defaults.showLabel);
  }

  addBars(svg, data) {
    const self = this;
    const color = this.handler.data.getColorFunc();
    const tooltip = this.baseChart.tooltip;
    const isTooltip = this.handler.visConfig.get('tooltip.show');

    const layer = svg
      .append('g')
      .attr('class', 'series histogram')
      .attr('clip-path', 'url(#' + this.baseChart.clipPathId + ')');

    const bars = layer.selectAll('rect').data(
      data.values.filter(function (d) {
        return !_.isNull(d.y);
      })
    );

    bars.exit().remove();

    bars
      .enter()
      .append('rect')
      .attr('data-label', data.label)
      .attr('fill', () => color(data.label))
      .attr('stroke', () => color(data.label));

    self.updateBars(bars);

    // Add tooltip
    if (isTooltip) {
      bars.call(tooltip.render());
    }

    return bars;
  }

  /**
   * Determines whether bars are grouped or stacked and updates the D3
   * selection
   *
   * @method updateBars
   * @param bars {D3.UpdateSelection} SVG with rect added
   * @returns {D3.UpdateSelection}
   */
  updateBars(bars) {
    if (this.seriesConfig.mode === 'stacked') {
      return this.addStackedBars(bars);
    }
    return this.addGroupedBars(bars);
  }

  /**
   * Adds stacked bars to column chart visualization
   *
   * @method addStackedBars
   * @param bars {D3.UpdateSelection} SVG with rect added
   * @returns {D3.UpdateSelection}
   */
  addStackedBars(bars) {
    const xScale = this.getCategoryAxis().getScale();
    const yScale = this.getValueAxis().getScale();
    const isHorizontal = this.getCategoryAxis().axisConfig.isHorizontal();
    const isTimeScale = this.getCategoryAxis().axisConfig.isTimeDomain();
    const isLabels = this.labelOptions.show;
    const yMin = yScale.domain()[0];
    const gutterSpacingPercentage = 0.15;
    const chartData = this.chartData;
    const getGroupedNum = this.getGroupedNum.bind(this);
    const groupCount = this.getGroupedCount();

    let barWidth;
    let gutterWidth;

    if (isTimeScale) {
      const { min, interval } = this.handler.data.get('ordered');
      let intervalWidth = xScale(min + interval) - xScale(min);
      intervalWidth = Math.abs(intervalWidth);

      gutterWidth = intervalWidth * gutterSpacingPercentage;
      barWidth = (intervalWidth - gutterWidth) / groupCount;
    }

    function x(d, i) {
      const groupNum = getGroupedNum(d.seriesId);

      if (isTimeScale) {
        return (
          xScale(d.x) +
          datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount) * groupNum
        );
      }
      return xScale(d.x) + (xScale.rangeBand() / groupCount) * groupNum;
    }

    function y(d) {
      if ((isHorizontal && d.y < 0) || (!isHorizontal && d.y > 0)) {
        return yScale(d.y0);
      }
      return yScale(d.y0 + d.y);
    }

    function labelX(d, i) {
      return x(d, i) + widthFunc(d, i) / 2;
    }

    function labelY(d) {
      return y(d) + heightFunc(d) / 2;
    }

    function labelDisplay(d, i) {
      if (isHorizontal && this.getBBox().width > widthFunc(d, i)) return 'none';
      if (!isHorizontal && this.getBBox().width > heightFunc(d)) return 'none';
      if (isHorizontal && this.getBBox().height > heightFunc(d)) return 'none';
      if (!isHorizontal && this.getBBox().height > widthFunc(d, i)) return 'none';
      return 'block';
    }

    function widthFunc(d, i) {
      if (isTimeScale) {
        return datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount);
      }
      return xScale.rangeBand() / groupCount;
    }

    function heightFunc(d) {
      // for split bars or for one series,
      // last series will have d.y0 = 0
      if (d.y0 === 0 && yMin > 0) {
        return yScale(yMin) - yScale(d.y);
      }
      return Math.abs(yScale(d.y0) - yScale(d.y0 + d.y));
    }

    function formatValue(d) {
      return chartData.yAxisFormatter(d.y);
    }

    // update
    bars
      .attr('x', isHorizontal ? x : y)
      .attr('width', isHorizontal ? widthFunc : heightFunc)
      .attr('y', isHorizontal ? y : x)
      .attr('height', isHorizontal ? heightFunc : widthFunc);

    const layer = d3.select(bars[0].parentNode);
    const barLabels = layer.selectAll('text').data(
      chartData.values.filter(function (d) {
        return !_.isNull(d.y);
      })
    );

    if (isLabels) {
      const colorFunc = this.handler.data.getColorFunc();
      const d3Color = d3.rgb(colorFunc(chartData.label));
      let labelClass;
      if (isColorDark(d3Color.r, d3Color.g, d3Color.b)) {
        labelClass = 'visColumnChart__bar-label--light';
      } else {
        labelClass = 'visColumnChart__bar-label--dark';
      }

      barLabels
        .enter()
        .append('text')
        .text(formatValue)
        .attr('class', `visColumnChart__barLabel visColumnChart__barLabel--stack ${labelClass}`)
        .attr('x', isHorizontal ? labelX : labelY)
        .attr('y', isHorizontal ? labelY : labelX)

        // display must apply last, because labelDisplay decision it based
        // on text bounding box which depends on actual applied style.
        .attr('display', labelDisplay);
    }

    return bars;
  }

  /**
   * Adds grouped bars to column chart visualization
   *
   * @method addGroupedBars
   * @param bars {D3.UpdateSelection} SVG with rect added
   * @returns {D3.UpdateSelection}
   */
  addGroupedBars(bars) {
    const xScale = this.getCategoryAxis().getScale();
    const yScale = this.getValueAxis().getScale();
    const chartData = this.chartData;
    const groupCount = this.getGroupedCount();
    const gutterSpacingPercentage = 0.15;
    const isTimeScale = this.getCategoryAxis().axisConfig.isTimeDomain();
    const isHorizontal = this.getCategoryAxis().axisConfig.isHorizontal();
    const isLogScale = this.getValueAxis().axisConfig.isLogScale();
    const isLabels = this.labelOptions.show;
    const getGroupedNum = this.getGroupedNum.bind(this);

    let barWidth;
    let gutterWidth;

    if (isTimeScale) {
      const { min, interval } = this.handler.data.get('ordered');
      let intervalWidth = xScale(min + interval) - xScale(min);
      intervalWidth = Math.abs(intervalWidth);

      gutterWidth = intervalWidth * gutterSpacingPercentage;
      barWidth = (intervalWidth - gutterWidth) / groupCount;
    }

    function x(d, i) {
      const groupNum = getGroupedNum(d.seriesId);
      if (isTimeScale) {
        return (
          xScale(d.x) +
          datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount) * groupNum
        );
      }
      return xScale(d.x) + (xScale.rangeBand() / groupCount) * groupNum;
    }

    function y(d) {
      if ((isHorizontal && d.y < 0) || (!isHorizontal && d.y > 0)) {
        return yScale(0);
      }
      return yScale(d.y);
    }

    function labelX(d, i) {
      return x(d, i) + widthFunc(d, i) / 2;
    }

    function labelY(d) {
      if (isHorizontal) {
        return d.y >= 0 ? y(d) - 4 : y(d) + heightFunc(d) + this.getBBox().height;
      }
      return d.y >= 0 ? y(d) + heightFunc(d) + 4 : y(d) - this.getBBox().width - 4;
    }

    function labelDisplay(d, i) {
      if (isHorizontal && this.getBBox().width > widthFunc(d, i)) {
        return 'none';
      }
      if (!isHorizontal && this.getBBox().height > widthFunc(d)) {
        return 'none';
      }
      return 'block';
    }
    function widthFunc(d, i) {
      if (isTimeScale) {
        return datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount);
      }
      return xScale.rangeBand() / groupCount;
    }

    function heightFunc(d) {
      const baseValue = isLogScale ? 1 : 0;
      return Math.abs(yScale(baseValue) - yScale(d.y));
    }

    function formatValue(d) {
      return chartData.yAxisFormatter(d.y);
    }

    // update
    bars
      .attr('x', isHorizontal ? x : y)
      .attr('width', isHorizontal ? widthFunc : heightFunc)
      .attr('y', isHorizontal ? y : x)
      .attr('height', isHorizontal ? heightFunc : widthFunc);

    const layer = d3.select(bars[0].parentNode);
    const barLabels = layer.selectAll('text').data(
      chartData.values.filter(function (d) {
        return !_.isNull(d.y);
      })
    );

    barLabels.exit().remove();

    if (isLabels) {
      const labelColor = this.handler.data.getColorFunc()(chartData.label);

      barLabels
        .enter()
        .append('text')
        .text(formatValue)
        .attr('class', 'visColumnChart__barLabel')
        .attr('x', isHorizontal ? labelX : labelY)
        .attr('y', isHorizontal ? labelY : labelX)
        .attr('dominant-baseline', isHorizontal ? 'auto' : 'central')
        .attr('text-anchor', isHorizontal ? 'middle' : 'start')
        .attr('fill', labelColor)

        // display must apply last, because labelDisplay decision it based
        // on text bounding box which depends on actual applied style.
        .attr('display', labelDisplay);
    }
    return bars;
  }

  /**
   * Renders d3 visualization
   *
   * @method draw
   * @returns {Function} Creates the vertical bar chart
   */
  draw() {
    const self = this;

    return function (selection) {
      selection.each(function () {
        const svg = self.chartEl.append('g');
        svg.data([self.chartData]);

        const bars = self.addBars(svg, self.chartData);
        self.addCircleEvents(bars);

        if (self.thresholdLineOptions.show) {
          self.addThresholdLine(self.chartEl);
        }

        self.events.emit('rendered', {
          chart: self.chartData,
        });

        return svg;
      });
    };
  }
}
