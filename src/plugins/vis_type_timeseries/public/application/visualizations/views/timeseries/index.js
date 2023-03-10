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

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  Axis,
  Chart,
  Position,
  Settings,
  AnnotationDomainType,
  LineAnnotation,
  TooltipType,
  StackMode,
} from '@elastic/charts';
import { EuiIcon } from '@elastic/eui';
import { getTimezone } from '../../../lib/get_timezone';
import { eventBus, ACTIVE_CURSOR } from '../../lib/active_cursor';
import { getUISettings, getChartsSetup } from '../../../../services';
import { GRID_LINE_CONFIG, ICON_TYPES_MAP, STACKED_OPTIONS } from '../../constants';
import { AreaSeriesDecorator } from './decorators/area_decorator';
import { BarSeriesDecorator } from './decorators/bar_decorator';
import { getStackAccessors } from './utils/stack_format';
import { getBaseTheme, getChartClasses } from './utils/theme';

const generateAnnotationData = (values, formatter) =>
  values.map(({ key, docs }) => ({
    dataValue: key,
    details: docs[0],
    header: formatter({
      value: key,
    }),
  }));

const decorateFormatter = (formatter) => ({ value }) => formatter(value);

const handleCursorUpdate = (cursor) => {
  eventBus.trigger(ACTIVE_CURSOR, cursor);
};

export const TimeSeries = ({
  backgroundColor,
  showGrid,
  legend,
  legendPosition,
  tooltipMode,
  xAxisLabel,
  series,
  yAxis,
  onBrush,
  xAxisFormatter,
  annotations,
}) => {
  const chartRef = useRef();

  useEffect(() => {
    const updateCursor = (_, cursor) => {
      if (chartRef.current) {
        chartRef.current.dispatchExternalPointerEvent(cursor);
      }
    };

    eventBus.on(ACTIVE_CURSOR, updateCursor);

    return () => {
      eventBus.off(ACTIVE_CURSOR, undefined, updateCursor);
    };
  }, []);

  const tooltipFormatter = decorateFormatter(xAxisFormatter);
  const uiSettings = getUISettings();
  const timeZone = getTimezone(uiSettings);
  const hasBarChart = series.some(({ bars }) => bars?.show);

  // apply legend style change if bgColor is configured
  const classes = classNames('tvbVisTimeSeries', getChartClasses(backgroundColor));

  // If the color isn't configured by the user, use the color mapping service
  // to assign a color from the OpenSearch Dashboards palette. Colors will be shared across the
  // session, including dashboards.
  const { colors, theme: themeService } = getChartsSetup();
  const baseTheme = getBaseTheme(themeService.useChartsBaseTheme(), backgroundColor);

  colors.mappedColors.mapKeys(series.filter(({ color }) => !color).map(({ label }) => label));

  const onBrushEndListener = ({ x }) => {
    if (!x) {
      return;
    }
    const [min, max] = x;
    onBrush(min, max);
  };

  return (
    <Chart ref={chartRef} renderer="canvas" className={classes}>
      <Settings
        showLegend={legend}
        showLegendExtra={true}
        legendPosition={legendPosition}
        onBrushEnd={onBrushEndListener}
        animateData={false}
        onPointerUpdate={handleCursorUpdate}
        theme={[
          hasBarChart
            ? {}
            : {
                crosshair: {
                  band: {
                    fill: '#F00',
                  },
                },
              },
          {
            background: {
              color: backgroundColor,
            },
          },
        ]}
        baseTheme={baseTheme}
        tooltip={{
          snap: true,
          type: tooltipMode === 'show_focused' ? TooltipType.Follow : TooltipType.VerticalCursor,
          headerFormatter: tooltipFormatter,
        }}
        externalPointerEvents={{ tooltip: { visible: false } }}
      />

      {annotations.map(({ id, data, icon, color }) => {
        const dataValues = generateAnnotationData(data, tooltipFormatter);
        const style = { line: { stroke: color } };

        return (
          <LineAnnotation
            key={id}
            id={id}
            domainType={AnnotationDomainType.XDomain}
            dataValues={dataValues}
            marker={<EuiIcon type={ICON_TYPES_MAP[icon] || 'asterisk'} />}
            hideLinesTooltips={true}
            style={style}
          />
        );
      })}

      {series.map(
        (
          {
            id,
            label,
            bars,
            lines,
            data,
            hideInLegend,
            xScaleType,
            yScaleType,
            groupId,
            color,
            stack,
            points,
            useDefaultGroupDomain,
            y1AccessorFormat,
            y0AccessorFormat,
            tickFormat,
          },
          sortIndex
        ) => {
          const stackAccessors = getStackAccessors(stack);
          const isPercentage = stack === STACKED_OPTIONS.PERCENT;
          const isStacked = stack !== STACKED_OPTIONS.NONE;
          const key = `${id}-${label}`;
          // Only use color mapping if there is no color from the server
          const finalColor = color ?? colors.mappedColors.mapping[label];

          if (bars?.show) {
            return (
              <BarSeriesDecorator
                key={key}
                seriesId={id}
                seriesGroupId={groupId}
                name={label.toString()}
                data={data}
                hideInLegend={hideInLegend}
                bars={bars}
                color={finalColor}
                stackAccessors={stackAccessors}
                stackMode={isPercentage ? StackMode.Percentage : undefined}
                xScaleType={xScaleType}
                yScaleType={yScaleType}
                timeZone={timeZone}
                enableHistogramMode={isStacked}
                useDefaultGroupDomain={useDefaultGroupDomain}
                sortIndex={sortIndex}
                y1AccessorFormat={y1AccessorFormat}
                y0AccessorFormat={y0AccessorFormat}
                tickFormat={tickFormat}
              />
            );
          }

          if (lines?.show) {
            return (
              <AreaSeriesDecorator
                key={key}
                seriesId={id}
                seriesGroupId={groupId}
                name={label.toString()}
                data={data}
                hideInLegend={hideInLegend}
                lines={lines}
                color={finalColor}
                stackAccessors={stackAccessors}
                stackMode={isPercentage ? StackMode.Percentage : undefined}
                points={points}
                xScaleType={xScaleType}
                yScaleType={yScaleType}
                timeZone={timeZone}
                enableHistogramMode={isStacked}
                useDefaultGroupDomain={useDefaultGroupDomain}
                sortIndex={sortIndex}
                y1AccessorFormat={y1AccessorFormat}
                y0AccessorFormat={y0AccessorFormat}
                tickFormat={tickFormat}
              />
            );
          }

          return null;
        }
      )}

      {yAxis.map(({ id, groupId, position, tickFormatter, domain, hide }) => (
        <Axis
          key={groupId}
          groupId={groupId}
          id={id}
          position={position}
          domain={domain}
          hide={hide}
          gridLine={{
            ...GRID_LINE_CONFIG,
            visible: showGrid,
          }}
          tickFormat={tickFormatter}
        />
      ))}

      <Axis
        id="bottom"
        position={Position.Bottom}
        title={xAxisLabel}
        tickFormat={xAxisFormatter}
        gridLine={{
          ...GRID_LINE_CONFIG,
          visible: showGrid,
        }}
      />
    </Chart>
  );
};

TimeSeries.defaultProps = {
  showGrid: true,
  legend: true,
  legendPosition: 'right',
};

TimeSeries.propTypes = {
  backgroundColor: PropTypes.string,
  showGrid: PropTypes.bool,
  legend: PropTypes.bool,
  legendPosition: PropTypes.string,
  xAxisLabel: PropTypes.string,
  series: PropTypes.array,
  yAxis: PropTypes.array,
  onBrush: PropTypes.func,
  xAxisFormatter: PropTypes.func,
  annotations: PropTypes.array,
};
