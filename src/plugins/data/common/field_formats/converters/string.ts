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

import { i18n } from '@osd/i18n';
import { asPrettyString } from '../utils';
import { OSD_FIELD_TYPES } from '../../osd_field_types/types';
import { FieldFormat } from '../field_format';
import { TextContextTypeConvert, FIELD_FORMAT_IDS } from '../types';
import { shortenDottedString } from '../../utils';

const TRANSFORM_OPTIONS = [
  {
    kind: false,
    text: i18n.translate('data.fieldFormats.string.transformOptions.none', {
      defaultMessage: '- None -',
    }),
  },
  {
    kind: 'lower',
    text: i18n.translate('data.fieldFormats.string.transformOptions.lower', {
      defaultMessage: 'Lower Case',
    }),
  },
  {
    kind: 'upper',
    text: i18n.translate('data.fieldFormats.string.transformOptions.upper', {
      defaultMessage: 'Upper Case',
    }),
  },
  {
    kind: 'title',
    text: i18n.translate('data.fieldFormats.string.transformOptions.title', {
      defaultMessage: 'Title Case',
    }),
  },
  {
    kind: 'short',
    text: i18n.translate('data.fieldFormats.string.transformOptions.short', {
      defaultMessage: 'Short Dots',
    }),
  },
  {
    kind: 'base64',
    text: i18n.translate('data.fieldFormats.string.transformOptions.base64', {
      defaultMessage: 'Base64 Decode',
    }),
  },
  {
    kind: 'urlparam',
    text: i18n.translate('data.fieldFormats.string.transformOptions.url', {
      defaultMessage: 'URL Param Decode',
    }),
  },
];
const DEFAULT_TRANSFORM_OPTION = false;

export class StringFormat extends FieldFormat {
  static id = FIELD_FORMAT_IDS.STRING;
  static title = i18n.translate('data.fieldFormats.string.title', {
    defaultMessage: 'String',
  });
  static fieldType = [
    OSD_FIELD_TYPES.NUMBER,
    OSD_FIELD_TYPES.BOOLEAN,
    OSD_FIELD_TYPES.DATE,
    OSD_FIELD_TYPES.IP,
    OSD_FIELD_TYPES.ATTACHMENT,
    OSD_FIELD_TYPES.GEO_POINT,
    OSD_FIELD_TYPES.GEO_SHAPE,
    OSD_FIELD_TYPES.STRING,
    OSD_FIELD_TYPES.MURMUR3,
    OSD_FIELD_TYPES.UNKNOWN,
    OSD_FIELD_TYPES.CONFLICT,
  ];
  static transformOptions = TRANSFORM_OPTIONS;

  getParamDefaults() {
    return {
      transform: DEFAULT_TRANSFORM_OPTION,
    };
  }

  private base64Decode(val: string) {
    try {
      return Buffer.from(val, 'base64').toString('utf8');
    } catch (e) {
      return asPrettyString(val);
    }
  }

  private toTitleCase(val: string) {
    return val.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  textConvert: TextContextTypeConvert = (val) => {
    switch (this.param('transform')) {
      case 'lower':
        return String(val).toLowerCase();
      case 'upper':
        return String(val).toUpperCase();
      case 'title':
        return this.toTitleCase(val);
      case 'short':
        return shortenDottedString(val);
      case 'base64':
        return this.base64Decode(val);
      case 'urlparam':
        return decodeURIComponent(val);
      default:
        return asPrettyString(val);
    }
  };
}
