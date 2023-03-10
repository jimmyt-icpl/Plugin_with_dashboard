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

import { getTelemetryOptIn } from './get_telemetry_opt_in';
import { TelemetrySavedObject } from './types';

describe('getTelemetryOptIn', () => {
  it('returns null when saved object not found', () => {
    const params = getCallGetTelemetryOptInParams({
      savedObjectNotFound: true,
    });

    const result = callGetTelemetryOptIn(params);

    expect(result).toBe(null);
  });

  it('returns false when saved object forbidden', () => {
    const params = getCallGetTelemetryOptInParams({
      savedObjectForbidden: true,
    });

    const result = callGetTelemetryOptIn(params);

    expect(result).toBe(false);
  });

  it('returns null if enabled is null or undefined', () => {
    for (const enabled of [null, undefined]) {
      const params = getCallGetTelemetryOptInParams({
        enabled,
      });

      const result = callGetTelemetryOptIn(params);

      expect(result).toBe(null);
    }
  });

  it('returns true when enabled is true', () => {
    const params = getCallGetTelemetryOptInParams({
      enabled: true,
    });

    const result = callGetTelemetryOptIn(params);

    expect(result).toBe(true);
  });

  // build a table of tests with version checks, with results for enabled false
  type VersionCheckTable = Array<Partial<CallGetTelemetryOptInParams>>;

  const EnabledFalseVersionChecks: VersionCheckTable = [
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: '8.0.0', result: false },
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: '8.0.1', result: false },
    { lastVersionChecked: '8.0.1', currentOpenSearchDashboardsVersion: '8.0.0', result: false },
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: '8.1.0', result: null },
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: '9.0.0', result: null },
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: '7.0.0', result: false },
    { lastVersionChecked: '8.1.0', currentOpenSearchDashboardsVersion: '8.0.0', result: false },
    { lastVersionChecked: '8.0.0-X', currentOpenSearchDashboardsVersion: '8.0.0', result: false },
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: '8.0.0-X', result: false },
    { lastVersionChecked: null, currentOpenSearchDashboardsVersion: '8.0.0', result: null },
    { lastVersionChecked: undefined, currentOpenSearchDashboardsVersion: '8.0.0', result: null },
    { lastVersionChecked: 5, currentOpenSearchDashboardsVersion: '8.0.0', result: null },
    { lastVersionChecked: '8.0.0', currentOpenSearchDashboardsVersion: 'beta', result: null },
    { lastVersionChecked: 'beta', currentOpenSearchDashboardsVersion: '8.0.0', result: null },
    { lastVersionChecked: 'beta', currentOpenSearchDashboardsVersion: 'beta', result: false },
    { lastVersionChecked: 'BETA', currentOpenSearchDashboardsVersion: 'beta', result: null },
  ].map((el) => ({ ...el, enabled: false }));

  // build a table of tests with version checks, with results for enabled true/null/undefined
  const EnabledTrueVersionChecks: VersionCheckTable = EnabledFalseVersionChecks.map((el) => ({
    ...el,
    enabled: true,
    result: true,
  }));

  const EnabledNullVersionChecks: VersionCheckTable = EnabledFalseVersionChecks.map((el) => ({
    ...el,
    enabled: null,
    result: null,
  }));

  const EnabledUndefinedVersionChecks: VersionCheckTable = EnabledFalseVersionChecks.map((el) => ({
    ...el,
    enabled: undefined,
    result: null,
  }));

  const AllVersionChecks = [
    ...EnabledFalseVersionChecks,
    ...EnabledTrueVersionChecks,
    ...EnabledNullVersionChecks,
    ...EnabledUndefinedVersionChecks,
  ];

  test.each(AllVersionChecks)(
    'returns expected result for version check with %j',
    async (params: Partial<CallGetTelemetryOptInParams>) => {
      const result = await callGetTelemetryOptIn({ ...DefaultParams, ...params });
      expect(result).toBe(params.result);
    }
  );
});

interface CallGetTelemetryOptInParams {
  savedObjectNotFound: boolean;
  savedObjectForbidden: boolean;
  lastVersionChecked?: any; // should be a string, but test with non-strings
  currentOpenSearchDashboardsVersion: string;
  result?: boolean | null;
  enabled: boolean | null | undefined;
  configTelemetryOptIn: boolean | null;
  allowChangingOptInStatus: boolean;
}

const DefaultParams = {
  savedObjectNotFound: false,
  savedObjectForbidden: false,
  enabled: true,
  lastVersionChecked: '8.0.0',
  currentOpenSearchDashboardsVersion: '8.0.0',
  configTelemetryOptIn: null,
  allowChangingOptInStatus: true,
};

function getCallGetTelemetryOptInParams(
  overrides: Partial<CallGetTelemetryOptInParams>
): CallGetTelemetryOptInParams {
  return { ...DefaultParams, ...overrides };
}

function callGetTelemetryOptIn(params: CallGetTelemetryOptInParams) {
  const {
    currentOpenSearchDashboardsVersion,
    configTelemetryOptIn,
    allowChangingOptInStatus,
  } = params;
  const telemetrySavedObject = getMockTelemetrySavedObject(params);
  return getTelemetryOptIn({
    currentOpenSearchDashboardsVersion,
    telemetrySavedObject,
    allowChangingOptInStatus,
    configTelemetryOptIn,
  });
}

function getMockTelemetrySavedObject(params: CallGetTelemetryOptInParams): TelemetrySavedObject {
  const { savedObjectNotFound, savedObjectForbidden } = params;
  if (savedObjectForbidden) {
    return false;
  }
  if (savedObjectNotFound) {
    return null;
  }

  return {
    enabled: params.enabled,
    lastVersionChecked: params.lastVersionChecked,
  };
}
