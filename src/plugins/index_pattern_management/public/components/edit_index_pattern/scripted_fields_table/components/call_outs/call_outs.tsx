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

import React from 'react';

import { EuiCallOut, EuiLink, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';

interface CallOutsProps {
  deprecatedLangsInUse: string[];
  painlessDocLink: string;
}

export const CallOuts = ({ deprecatedLangsInUse, painlessDocLink }: CallOutsProps) => {
  if (!deprecatedLangsInUse.length) {
    return null;
  }

  return (
    <>
      <EuiCallOut
        title={
          <FormattedMessage
            id="indexPatternManagement.editIndexPattern.scripted.deprecationLangHeader"
            defaultMessage="Deprecation languages in use"
          />
        }
        color="danger"
        iconType="cross"
      >
        <p>
          <FormattedMessage
            id="indexPatternManagement.editIndexPattern.scripted.deprecationLangLabel.deprecationLangDetail"
            defaultMessage="The following deprecated languages are in use: {deprecatedLangsInUse}. Support for these languages will be
            removed in the next major version of OpenSearch Dashboards and OpenSearch. Convert you scripted fields to {link} to avoid any problems."
            values={{
              deprecatedLangsInUse: deprecatedLangsInUse.join(', '),
              link: (
                <EuiLink href={painlessDocLink}>
                  <FormattedMessage
                    id="indexPatternManagement.editIndexPattern.scripted.deprecationLangLabel.painlessDescription"
                    defaultMessage="Painless"
                  />
                </EuiLink>
              ),
            }}
          />
        </p>
      </EuiCallOut>
      <EuiSpacer size="m" />
    </>
  );
};
