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

/**
 * Matches every single [A-Za-z] character, `<tag attr="any > text">`, `](markdown-link-address)` and `@I18N@valid_variable_name@I18N@`
 */
const CHARS_FOR_PSEUDO_LOCALIZATION_REGEX = /[A-Za-z]|(\]\([\s\S]*?\))|(<([^"<>]|("[^"]*?"))*?>)|(@I18N@\w*?@I18N@)/g;
const PSEUDO_ACCENTS_LOCALE = 'en-xa';

export function isPseudoLocale(locale: string) {
  return locale.toLowerCase() === PSEUDO_ACCENTS_LOCALE;
}

/**
 * Replaces every latin char by pseudo char and repeats every third char twice.
 */
function replacer() {
  let count = 0;

  return (match: string) => {
    // if `match.length !== 1`, then `match` is html tag or markdown link address, so it should be ignored
    if (match.length !== 1) {
      return match;
    }

    const pseudoChar = pseudoAccentCharMap[match] || match;
    return ++count % 3 === 0 ? pseudoChar.repeat(2) : pseudoChar;
  };
}

export function translateUsingPseudoLocale(message: string) {
  return message.replace(CHARS_FOR_PSEUDO_LOCALIZATION_REGEX, replacer());
}

const pseudoAccentCharMap: Record<string, string> = {
  a: '??',
  b: '??',
  c: '??',
  d: '??',
  e: '??',
  f: '??',
  g: '??',
  h: '??',
  i: '??',
  l: '??',
  k: '??',
  j: '??',
  m: '??',
  n: '??',
  o: '??',
  p: '??',
  q: '??',
  r: '??',
  s: '??',
  t: '??',
  u: '??',
  v: '???',
  w: '??',
  x: '???',
  y: '??',
  z: '??',
  A: '??',
  B: '??',
  C: '??',
  D: '??',
  E: '??',
  F: '??',
  G: '??',
  H: '??',
  I: '??',
  L: '??',
  K: '??',
  J: '??',
  M: '???',
  N: '??',
  O: '??',
  P: '??',
  Q: '??',
  R: '??',
  S: '??',
  T: '??',
  U: '??',
  V: '???',
  W: '??',
  X: '???',
  Y: '??',
  Z: '??',
};
