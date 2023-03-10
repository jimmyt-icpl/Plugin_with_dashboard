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

import dedent from 'dedent';

import { TemplateContext } from '../template_context';

function generator({
  imageTag,
  imageFlavor,
  version,
  dockerTargetFilename,
  baseOSImage,
  ubiImageFlavor,
}: TemplateContext) {
  return dedent(`
  #!/usr/bin/env bash
  #
  # ** THIS IS AN AUTO-GENERATED FILE **
  #
  set -euo pipefail

  retry_docker_pull() {
    image=$1
    attempt=0
    max_retries=5

    while true
    do
      attempt=$((attempt+1))

      if [ $attempt -gt $max_retries ]
      then
        echo "Docker pull retries exceeded, aborting."
        exit 1
      fi

      if docker pull "$image"
      then
        echo "Docker pull successful."
        break
      else
        echo "Docker pull unsuccessful, attempt '$attempt'."
      fi

    done
  }

  retry_docker_pull ${baseOSImage}

  echo "Building: opensearch-dashboards${imageFlavor}${ubiImageFlavor}-docker"; \\
  docker build -t ${imageTag}${imageFlavor}${ubiImageFlavor}:${version} -f Dockerfile . || exit 1;

  docker save ${imageTag}${imageFlavor}${ubiImageFlavor}:${version} | gzip -c > ${dockerTargetFilename}

  exit 0
  `);
}

export const buildDockerSHTemplate = {
  name: 'build_docker.sh',
  generator,
};
