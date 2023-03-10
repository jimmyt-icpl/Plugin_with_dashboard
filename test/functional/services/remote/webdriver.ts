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

import { resolve } from 'path';
import Fs from 'fs';

import * as Rx from 'rxjs';
import { mergeMap, map, takeUntil, catchError } from 'rxjs/operators';
import { Lifecycle } from '@osd/test/src/functional_test_runner/lib/lifecycle';
import { ToolingLog } from '@osd/dev-utils';
import chromeDriver from 'chromedriver';
// @ts-ignore types not available
import geckoDriver from 'geckodriver';
import { Builder, logging } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import edge from 'selenium-webdriver/edge';
// @ts-ignore internal modules are not typed
import { Executor } from 'selenium-webdriver/lib/http';
// @ts-ignore internal modules are not typed
import { getLogger } from 'selenium-webdriver/lib/logging';
import { installDriver } from 'ms-chromium-edge-driver';

import { REPO_ROOT } from '@osd/utils';
import { pollForLogEntry$ } from './poll_for_log_entry';
import { createStdoutSocket } from './create_stdout_stream';
import { preventParallelCalls } from './prevent_parallel_calls';

import { Browsers } from './browsers';

const throttleOption: string = process.env.TEST_THROTTLE_NETWORK as string;
const headlessBrowser: string = process.env.TEST_BROWSER_HEADLESS as string;
const browserBinaryPath: string = process.env.TEST_BROWSER_BINARY_PATH as string;
const remoteDebug: string = process.env.TEST_REMOTE_DEBUG as string;
const certValidation: string = process.env.NODE_TLS_REJECT_UNAUTHORIZED as string;
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const NO_QUEUE_COMMANDS = ['getLog', 'getStatus', 'newSession', 'quit'];
const downloadDir = resolve(REPO_ROOT, 'target/functional-tests/downloads');
const chromiumUserPrefs = {
  'download.default_directory': downloadDir,
  'download.prompt_for_download': false,
  'profile.content_settings.exceptions.clipboard': {
    '[*.],*': {
      last_modified: Date.now(),
      setting: 1,
    },
  },
};

/**
 * Best we can tell WebDriver locks up sometimes when we send too many
 * commands at once, sometimes... It causes random lockups where we never
 * receive another response from WedDriver and we don't want to live with
 * that risk, so for now I've shimmed the Executor class in WebDiver to
 * queue all calls to Executor#send() if there is already a call in
 * progress.
 */
Executor.prototype.execute = preventParallelCalls(
  Executor.prototype.execute,
  (command: { getName: () => string }) => NO_QUEUE_COMMANDS.includes(command.getName())
);

export interface BrowserConfig {
  logPollingMs: number;
  acceptInsecureCerts: boolean;
}

let attemptCounter = 0;
let edgePaths: { driverPath: string | undefined; browserPath: string | undefined };
async function attemptToCreateCommand(
  log: ToolingLog,
  browserType: Browsers,
  lifecycle: Lifecycle,
  config: BrowserConfig
) {
  const attemptId = ++attemptCounter;
  log.debug('[webdriver] Creating session');
  const remoteSessionUrl = process.env.REMOTE_SESSION_URL;

  const buildDriverInstance = async () => {
    switch (browserType) {
      case 'chrome': {
        const chromeOptions = new chrome.Options();
        chromeOptions.addArguments(
          // Disables the sandbox for all process types that are normally sandboxed.
          'no-sandbox',
          // Launches URL in new browser window.
          'new-window',
          // By default, file:// URIs cannot read other file:// URIs. This is an override for developers who need the old behavior for testing.
          'allow-file-access-from-files',
          // Use fake device for Media Stream to replace actual camera and microphone.
          'use-fake-device-for-media-stream',
          // Bypass the media stream infobar by selecting the default device for media streams (e.g. WebRTC). Works with --use-fake-device-for-media-stream.
          'use-fake-ui-for-media-stream'
        );

        if (process.platform === 'linux') {
          // The /dev/shm partition is too small in certain VM environments, causing
          // Chrome to fail or crash. Use this flag to work-around this issue
          // (a temporary directory will always be used to create anonymous shared memory files).
          chromeOptions.addArguments('disable-dev-shm-usage');
        }

        if (headlessBrowser === '1') {
          // Use --disable-gpu to avoid an error from a missing Mesa library, as per
          // See: https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
          chromeOptions.headless();
          chromeOptions.addArguments('disable-gpu');
        }

        if (certValidation === '0') {
          chromeOptions.addArguments('ignore-certificate-errors');
        }

        if (remoteDebug === '1') {
          // Visit chrome://inspect in chrome to remotely view/debug
          chromeOptions.headless();
          chromeOptions.addArguments('disable-gpu', 'remote-debugging-port=9222');
        }

        if (browserBinaryPath) {
          chromeOptions.setChromeBinaryPath(browserBinaryPath);
        }

        const prefs = new logging.Preferences();
        prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
        chromeOptions.setUserPreferences(chromiumUserPrefs);
        chromeOptions.setLoggingPrefs(prefs);
        chromeOptions.set('unexpectedAlertBehaviour', 'accept');
        chromeOptions.setAcceptInsecureCerts(config.acceptInsecureCerts);

        let session;
        if (remoteSessionUrl) {
          session = await new Builder()
            .forBrowser(browserType)
            .setChromeOptions(chromeOptions)
            .usingServer(remoteSessionUrl)
            .build();
        } else {
          session = await new Builder()
            .forBrowser(browserType)
            .setChromeOptions(chromeOptions)
            .setChromeService(new chrome.ServiceBuilder(chromeDriver.path).enableVerboseLogging())
            .build();
        }

        return {
          session,
          consoleLog$: pollForLogEntry$(session, logging.Type.BROWSER, config.logPollingMs).pipe(
            takeUntil(lifecycle.cleanup.after$),
            map(({ message, level: { name: level } }) => ({
              message: message.replace(/\\n/g, '\n'),
              level,
            }))
          ),
        };
      }

      case 'msedge': {
        if (edgePaths && edgePaths.browserPath && edgePaths.driverPath) {
          const edgeOptions = new edge.Options();
          if (headlessBrowser === '1') {
            // @ts-ignore internal modules are not typed
            edgeOptions.headless();
          }
          // @ts-ignore internal modules are not typed
          edgeOptions.setEdgeChromium(true);
          // @ts-ignore internal modules are not typed
          edgeOptions.setBinaryPath(edgePaths.browserPath);
          const options = edgeOptions.get('ms:edgeOptions');
          // overriding options to include preferences
          Object.assign(options, { prefs: chromiumUserPrefs });
          edgeOptions.set('ms:edgeOptions', options);
          const session = await new Builder()
            .forBrowser('MicrosoftEdge')
            .setEdgeOptions(edgeOptions)
            .setEdgeService(new edge.ServiceBuilder(edgePaths.driverPath))
            .build();
          return {
            session,
            consoleLog$: pollForLogEntry$(session, logging.Type.BROWSER, config.logPollingMs).pipe(
              takeUntil(lifecycle.cleanup.after$),
              map(({ message, level: { name: level } }) => ({
                message: message.replace(/\\n/g, '\n'),
                level,
              }))
            ),
          };
        } else {
          throw new Error(
            `Chromium Edge session requires browser or driver path to be defined: ${JSON.stringify(
              edgePaths
            )}`
          );
        }
      }

      case 'firefox': {
        const firefoxOptions = new firefox.Options();
        // Firefox 65+ supports logging console output to stdout
        firefoxOptions.set('moz:firefoxOptions', {
          prefs: { 'devtools.console.stdout.content': true },
        });
        firefoxOptions.setPreference('browser.download.folderList', 2);
        firefoxOptions.setPreference('browser.download.manager.showWhenStarting', false);
        firefoxOptions.setPreference('browser.download.dir', downloadDir);
        firefoxOptions.setPreference(
          'browser.helperApps.neverAsk.saveToDisk',
          'application/comma-separated-values, text/csv, text/plain'
        );
        firefoxOptions.setAcceptInsecureCerts(config.acceptInsecureCerts);

        if (headlessBrowser === '1') {
          // See: https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Headless_mode
          firefoxOptions.headless();
        }

        // Windows issue with stout socket https://github.com/elastic/kibana/issues/52053
        if (process.platform === 'win32') {
          const session = await new Builder()
            .forBrowser(browserType)
            .setFirefoxOptions(firefoxOptions)
            .setFirefoxService(new firefox.ServiceBuilder(geckoDriver.path))
            .build();
          return {
            session,
            consoleLog$: Rx.EMPTY,
          };
        }

        const { input, chunk$, cleanup } = await createStdoutSocket();
        lifecycle.cleanup.add(cleanup);

        const session = await new Builder()
          .forBrowser(browserType)
          .setFirefoxOptions(firefoxOptions)
          .setFirefoxService(
            new firefox.ServiceBuilder(geckoDriver.path).setStdio(['ignore', input, 'ignore'])
          )
          .build();

        const CONSOLE_LINE_RE = /^console\.([a-z]+): ([\s\S]+)/;

        return {
          session,
          consoleLog$: chunk$.pipe(
            map((chunk) => chunk.toString('utf8')),
            mergeMap((msg) => {
              const match = msg.match(CONSOLE_LINE_RE);
              if (!match) {
                log.debug('Firefox stdout: ' + msg);
                return [];
              }

              const [, level, message] = match;
              return [
                {
                  level,
                  message: message.trim(),
                },
              ];
            })
          ),
        };
      }

      default:
        throw new Error(`${browserType} is not supported yet`);
    }
  };

  const { session, consoleLog$ } = await buildDriverInstance();

  if (throttleOption === '1' && browserType === 'chrome') {
    // Only chrome supports this option.
    log.debug('NETWORK THROTTLED: 768k down, 256k up, 100ms latency.');

    (session as any).setNetworkConditions({
      offline: false,
      latency: 100, // Additional latency (ms).
      download_throughput: 768 * 1024, // These speeds are in bites per second, not kilobytes.
      upload_throughput: 256 * 1024,
    });
  }

  if (attemptId !== attemptCounter) {
    return;
  } // abort

  return { driver: session, consoleLog$ };
}

export async function initWebDriver(
  log: ToolingLog,
  browserType: Browsers,
  lifecycle: Lifecycle,
  config: BrowserConfig
) {
  const logger = getLogger('webdriver.http.Executor');
  logger.setLevel(logging.Level.FINEST);
  logger.addHandler((entry: { message: string }) => {
    if (entry.message.match(/\/session\/\w+\/log\b/)) {
      // ignore polling requests for logs
      return;
    }

    log.verbose(entry.message);
  });

  // create browser download folder
  Fs.mkdirSync(downloadDir, { recursive: true });

  // download Edge driver only in case of usage
  if (browserType === Browsers.ChromiumEdge) {
    edgePaths = await installDriver();
  }

  return await Rx.race(
    Rx.timer(2 * MINUTE).pipe(
      map(() => {
        throw new Error('remote failed to start within 2 minutes');
      })
    ),

    Rx.race(
      Rx.defer(async () => {
        const command = await attemptToCreateCommand(log, browserType, lifecycle, config);
        if (!command) {
          throw new Error('remote creation aborted');
        }
        return command;
      }),
      Rx.timer(30 * SECOND).pipe(
        map(() => {
          throw new Error('remote failed to start within 30 seconds');
        })
      )
    ).pipe(
      catchError((error, resubscribe) => {
        log.warning('Failure while creating webdriver instance');
        log.warning(error);
        log.warning('...retrying...');
        return resubscribe;
      })
    )
  ).toPromise();
}
