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
import template from './timeline_interval.html';

export function TimelineInterval($timeout) {
  return {
    restrict: 'E',
    scope: {
      // The interval model
      model: '=',
      changeInterval: '=',
    },
    template,
    link: function ($scope, $elem) {
      $scope.intervalOptions = ['auto', '1s', '1m', '1h', '1d', '1w', '1M', '1y', 'other'];
      $scope.intervalLabels = {
        auto: 'auto',
        '1s': '1 second',
        '1m': '1 minute',
        '1h': '1 hour',
        '1d': '1 day',
        '1w': '1 week',
        '1M': '1 month',
        '1y': '1 year',
        other: 'other',
      };

      $scope.$watch('model', function (newVal, oldVal) {
        // Only run this on initialization
        if (newVal !== oldVal || oldVal == null) return;

        if (_.includes($scope.intervalOptions, newVal)) {
          $scope.interval = newVal;
        } else {
          $scope.interval = 'other';
        }

        if (newVal !== 'other') {
          $scope.otherInterval = newVal;
        }
      });

      $scope.$watch('interval', function (newVal, oldVal) {
        if (newVal === oldVal || $scope.model === newVal) return;

        if (newVal === 'other') {
          $scope.otherInterval = oldVal;
          $scope.changeInterval($scope.otherInterval);
          $timeout(function () {
            $('input', $elem).select();
          }, 0);
        } else {
          $scope.otherInterval = $scope.interval;
          $scope.changeInterval($scope.interval);
        }
      });

      $scope.$watch('otherInterval', function (newVal, oldVal) {
        if (newVal === oldVal || $scope.model === newVal) return;
        $scope.changeInterval(newVal);
      });
    },
  };
}
