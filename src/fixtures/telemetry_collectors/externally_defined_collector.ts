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

import { CollectorSet, CollectorOptions } from '../../plugins/usage_collection/server/collector';
import { loggerMock } from '../../core/server/logging/logger.mock';

const collectorSet = new CollectorSet({
  logger: loggerMock.create(),
  maximumWaitTimeForAllCollectorsInS: 0,
});

interface Usage {
  locale: string;
}

function createCollector(): CollectorOptions<Usage> {
  return {
    type: 'from_fn_collector',
    isReady: () => true,
    fetch(): Usage {
      return {
        locale: 'en',
      };
    },
    schema: {
      locale: {
        type: 'keyword',
      },
    },
  };
}

export function defineCollectorFromVariable() {
  const fromVarCollector: CollectorOptions<Usage> = {
    type: 'from_variable_collector',
    isReady: () => true,
    fetch(): Usage {
      return {
        locale: 'en',
      };
    },
    schema: {
      locale: {
        type: 'keyword',
      },
    },
  };

  collectorSet.makeUsageCollector<Usage>(fromVarCollector);
}

export function defineCollectorFromFn() {
  const fromFnCollector = createCollector();

  collectorSet.makeUsageCollector<Usage>(fromFnCollector);
}
