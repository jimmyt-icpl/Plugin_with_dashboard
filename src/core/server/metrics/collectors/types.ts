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

/** Base interface for all metrics gatherers */
export interface MetricsCollector<T> {
  /** collect the data currently gathered by the collector */
  collect(): Promise<T>;
  /** reset the internal state of the collector */
  reset(): void;
}

/**
 * Process related metrics
 * @public
 */
export interface OpsProcessMetrics {
  /** process memory usage */
  memory: {
    /** heap memory usage */
    heap: {
      /** total heap available */
      total_in_bytes: number;
      /** used heap */
      used_in_bytes: number;
      /** v8 heap size limit */
      size_limit: number;
    };
    /** node rss */
    resident_set_size_in_bytes: number;
  };
  /** node event loop delay */
  event_loop_delay: number;
  /** pid of the OpenSearch Dashboards process */
  pid: number;
  /** uptime of the OpenSearch Dashboards process */
  uptime_in_millis: number;
}

/**
 * OS related metrics
 * @public
 */
export interface OpsOsMetrics {
  /** The os platform */
  platform: NodeJS.Platform;
  /** The os platform release, prefixed by the platform name */
  platformRelease: string;
  /** The os distrib. Only present for linux platforms */
  distro?: string;
  /** The os distrib release, prefixed by the os distrib. Only present for linux platforms */
  distroRelease?: string;
  /** cpu load metrics */
  load: {
    /** load for last minute */
    '1m': number;
    /** load for last 5 minutes */
    '5m': number;
    /** load for last 15 minutes */
    '15m': number;
  };
  /** system memory usage metrics */
  memory: {
    /** total memory available */
    total_in_bytes: number;
    /** current free memory */
    free_in_bytes: number;
    /** current used memory */
    used_in_bytes: number;
  };
  /** the OS uptime */
  uptime_in_millis: number;

  /** cpu accounting metrics, undefined when not running in a cgroup */
  cpuacct?: {
    /** name of this process's cgroup */
    control_group: string;
    /** cpu time used by this process's cgroup */
    usage_nanos: number;
  };

  /** cpu cgroup metrics, undefined when not running in a cgroup */
  cpu?: {
    /** name of this process's cgroup */
    control_group: string;
    /** the length of the cfs period */
    cfs_period_micros: number;
    /** total available run-time within a cfs period */
    cfs_quota_micros: number;
    /** current stats on the cfs periods */
    stat: {
      /** number of cfs periods that elapsed */
      number_of_elapsed_periods: number;
      /** number of times the cgroup has been throttled */
      number_of_times_throttled: number;
      /** total amount of time the cgroup has been throttled for */
      time_throttled_nanos: number;
    };
  };
}

/**
 * server related metrics
 * @public
 */
export interface OpsServerMetrics {
  /** server response time stats */
  response_times: {
    /** average response time */
    avg_in_millis: number;
    /** maximum response time */
    max_in_millis: number;
  };
  /** server requests stats */
  requests: {
    /** number of disconnected requests since startup */
    disconnects: number;
    /** total number of requests handled since startup */
    total: number;
    /** number of request handled per response status code */
    statusCodes: Record<number, number>;
  };
  /** number of current concurrent connections to the server */
  concurrent_connections: number;
}
