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

import { snakeCase } from 'lodash';
import { Logger, LegacyAPICaller, OpenSearchClient } from 'opensearch-dashboards/server';
import { Collector, CollectorOptions } from './collector';
import { UsageCollector } from './usage_collector';

interface CollectorSetConfig {
  logger: Logger;
  maximumWaitTimeForAllCollectorsInS?: number;
  collectors?: Array<Collector<any, any>>;
}

export class CollectorSet {
  private _waitingForAllCollectorsTimestamp?: number;
  private readonly logger: Logger;
  private readonly maximumWaitTimeForAllCollectorsInS: number;
  private readonly collectors: Map<string, Collector<any, any>>;
  constructor({ logger, maximumWaitTimeForAllCollectorsInS, collectors = [] }: CollectorSetConfig) {
    this.logger = logger;
    this.collectors = new Map(collectors.map((collector) => [collector.type, collector]));
    this.maximumWaitTimeForAllCollectorsInS = maximumWaitTimeForAllCollectorsInS || 60;
  }

  public makeStatsCollector = <T, U>(options: CollectorOptions<T, U>) => {
    return new Collector(this.logger, options);
  };
  public makeUsageCollector = <T, U = T>(options: CollectorOptions<T, U>) => {
    return new UsageCollector(this.logger, options);
  };

  /*
   * @param collector {Collector} collector object
   */
  public registerCollector = <T, U>(collector: Collector<T, U>) => {
    // check instanceof
    if (!(collector instanceof Collector)) {
      throw new Error('CollectorSet can only have Collector instances registered');
    }

    if (this.collectors.get(collector.type)) {
      throw new Error(`Usage collector's type "${collector.type}" is duplicated.`);
    }

    this.collectors.set(collector.type, collector);

    if (collector.init) {
      this.logger.debug(`Initializing ${collector.type} collector`);
      collector.init();
    }
  };

  public getCollectorByType = (type: string) => {
    return [...this.collectors.values()].find((c) => c.type === type);
  };

  public isUsageCollector = (x: UsageCollector | any): x is UsageCollector => {
    return x instanceof UsageCollector;
  };

  public areAllCollectorsReady = async (collectorSet: CollectorSet = this) => {
    if (!(collectorSet instanceof CollectorSet)) {
      throw new Error(
        `areAllCollectorsReady method given bad collectorSet parameter: ` + typeof collectorSet
      );
    }

    const collectors = [...collectorSet.collectors.values()];
    const collectorsWithStatus = await Promise.all(
      collectors.map(async (collector) => {
        return {
          isReady: await collector.isReady(),
          collector,
        };
      })
    );

    const collectorsTypesNotReady = collectorsWithStatus
      .filter((collectorWithStatus) => collectorWithStatus.isReady === false)
      .map((collectorWithStatus) => collectorWithStatus.collector.type);

    const allReady = collectorsTypesNotReady.length === 0;

    if (!allReady && this.maximumWaitTimeForAllCollectorsInS >= 0) {
      const nowTimestamp = +new Date();
      this._waitingForAllCollectorsTimestamp =
        this._waitingForAllCollectorsTimestamp || nowTimestamp;
      const timeWaitedInMS = nowTimestamp - this._waitingForAllCollectorsTimestamp;
      const timeLeftInMS = this.maximumWaitTimeForAllCollectorsInS * 1000 - timeWaitedInMS;
      if (timeLeftInMS <= 0) {
        this.logger.debug(
          `All collectors are not ready (waiting for ${collectorsTypesNotReady.join(',')}) ` +
            `but we have waited the required ` +
            `${this.maximumWaitTimeForAllCollectorsInS}s and will return data from all collectors that are ready.`
        );

        return true;
      } else {
        this.logger.debug(`All collectors are not ready. Waiting for ${timeLeftInMS}ms longer.`);
      }
    } else {
      this._waitingForAllCollectorsTimestamp = undefined;
    }

    return allReady;
  };

  // all collections eventually pass through bulkFetch.
  // the shape of the response is different when using the new OpenSearch client as is the error handling.
  // We'll handle the refactor for using the new client in a follow up PR.
  public bulkFetch = async (
    callCluster: LegacyAPICaller,
    opensearchClient: OpenSearchClient,
    collectors: Map<string, Collector<any, any>> = this.collectors
  ) => {
    const responses = await Promise.all(
      [...collectors.values()].map(async (collector) => {
        this.logger.debug(`Fetching data from ${collector.type} collector`);
        try {
          return {
            type: collector.type,
            result: await collector.fetch(callCluster, opensearchClient), // each collector must ensure they handle the response appropriately.
          };
        } catch (err) {
          this.logger.warn(err);
          this.logger.warn(`Unable to fetch data from ${collector.type} collector`);
        }
      })
    );

    return responses.filter(
      (response): response is { type: string; result: unknown } => typeof response !== 'undefined'
    );
  };

  /*
   * @return {new CollectorSet}
   */
  public getFilteredCollectorSet = (filter: (col: Collector) => boolean) => {
    const filtered = [...this.collectors.values()].filter(filter);
    return this.makeCollectorSetFromArray(filtered);
  };

  public bulkFetchUsage = async (
    callCluster: LegacyAPICaller,
    opensearchClient: OpenSearchClient
  ) => {
    const usageCollectors = this.getFilteredCollectorSet((c) => c instanceof UsageCollector);
    return await this.bulkFetch(callCluster, opensearchClient, usageCollectors.collectors);
  };

  // convert an array of fetched stats results into key/object
  public toObject = <Result, T>(statsData: Array<{ type: string; result: T }> = []) => {
    return statsData.reduce<Result>((accumulatedStats, { type, result }) => {
      return {
        ...accumulatedStats,
        [type]: result,
      };
    }, {} as Result);
  };

  // rename fields to use api conventions
  public toApiFieldNames = (apiData: any): any => {
    const getValueOrRecurse = (value: any) => {
      if (value == null || typeof value !== 'object') {
        return value;
      } else {
        return this.toApiFieldNames(value); // recurse
      }
    };

    // handle array and return early, or return a reduced object

    if (Array.isArray(apiData)) {
      return apiData.map(getValueOrRecurse);
    }

    return Object.keys(apiData).reduce((accum, field) => {
      const value = apiData[field];
      let newName = field;
      newName = snakeCase(newName);
      newName = newName.replace(/^(1|5|15)_m/, '$1m'); // os.load.15m, os.load.5m, os.load.1m
      newName = newName.replace('_in_bytes', '_bytes');
      newName = newName.replace('_in_millis', '_ms');

      return {
        ...accum,
        [newName]: getValueOrRecurse(value),
      };
    }, {});
  };

  // TODO: remove
  public map = (mapFn: any) => {
    return [...this.collectors.values()].map(mapFn);
  };

  // TODO: remove
  public some = (someFn: any) => {
    return [...this.collectors.values()].some(someFn);
  };

  private makeCollectorSetFromArray = (collectors: Collector[]) => {
    return new CollectorSet({
      logger: this.logger,
      maximumWaitTimeForAllCollectorsInS: this.maximumWaitTimeForAllCollectorsInS,
      collectors,
    });
  };
}
