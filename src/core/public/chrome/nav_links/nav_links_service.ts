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

import { sortBy } from 'lodash';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { InternalApplicationStart } from '../../application';
import { HttpStart } from '../../http';
import { ChromeNavLink, ChromeNavLinkUpdateableFields, NavLinkWrapper } from './nav_link';
import { toNavLink } from './to_nav_link';

interface StartDeps {
  application: InternalApplicationStart;
  http: HttpStart;
}

/**
 * {@link ChromeNavLinks | APIs} for manipulating nav links.
 *
 * @public
 */
export interface ChromeNavLinks {
  /**
   * Get an observable for a sorted list of navlinks.
   */
  getNavLinks$(): Observable<Array<Readonly<ChromeNavLink>>>;

  /**
   * Get the state of a navlink at this point in time.
   * @param id
   */
  get(id: string): ChromeNavLink | undefined;

  /**
   * Get the current state of all navlinks.
   */
  getAll(): Array<Readonly<ChromeNavLink>>;

  /**
   * Check whether or not a navlink exists.
   * @param id
   */
  has(id: string): boolean;

  /**
   * Remove all navlinks except the one matching the given id.
   *
   * @remarks
   * NOTE: this is not reversible.
   *
   * @param id
   */
  showOnly(id: string): void;

  /**
   * Update the navlink for the given id with the updated attributes.
   * Returns the updated navlink or `undefined` if it does not exist.
   *
   * @deprecated Uses the {@link AppBase.updater$} property when registering
   * your application with {@link ApplicationSetup.register} instead.
   *
   * @param id
   * @param values
   */
  update(id: string, values: ChromeNavLinkUpdateableFields): ChromeNavLink | undefined;

  /**
   * Enable forced navigation mode, which will trigger a page refresh
   * when a nav link is clicked and only the hash is updated.
   *
   * @remarks
   * This is only necessary when rendering the status page in place of another
   * app, as links to that app will set the current URL and change the hash, but
   * the routes for the correct are not loaded so nothing will happen.
   * https://github.com/elastic/kibana/pull/29770
   *
   * Used only by status_page plugin
   */
  enableForcedAppSwitcherNavigation(): void;

  /**
   * An observable of the forced app switcher state.
   */
  getForceAppSwitcherNavigation$(): Observable<boolean>;
}

type LinksUpdater = (navLinks: Map<string, NavLinkWrapper>) => Map<string, NavLinkWrapper>;

export class NavLinksService {
  private readonly stop$ = new ReplaySubject(1);

  public start({ application, http }: StartDeps): ChromeNavLinks {
    const appLinks$ = application.applications$.pipe(
      map((apps) => {
        return new Map(
          [...apps]
            .filter(([, app]) => !app.chromeless)
            .map(([appId, app]) => [appId, toNavLink(app, http.basePath)])
        );
      })
    );

    // now that availableApps$ is an observable, we need to keep record of all
    // manual link modifications to be able to re-apply then after every
    // availableApps$ changes.
    const linkUpdaters$ = new BehaviorSubject<LinksUpdater[]>([]);
    const navLinks$ = new BehaviorSubject<ReadonlyMap<string, NavLinkWrapper>>(new Map());

    combineLatest([appLinks$, linkUpdaters$])
      .pipe(
        map(([appLinks, linkUpdaters]) => {
          return linkUpdaters.reduce((links, updater) => updater(links), appLinks);
        })
      )
      .subscribe((navlinks) => {
        navLinks$.next(navlinks);
      });

    const forceAppSwitcherNavigation$ = new BehaviorSubject(false);

    return {
      getNavLinks$: () => {
        return navLinks$.pipe(map(sortNavLinks), takeUntil(this.stop$));
      },

      get(id: string) {
        const link = navLinks$.value.get(id);
        return link && link.properties;
      },

      getAll() {
        return sortNavLinks(navLinks$.value);
      },

      has(id: string) {
        return navLinks$.value.has(id);
      },

      showOnly(id: string) {
        if (!this.has(id)) {
          return;
        }

        const updater: LinksUpdater = (navLinks) =>
          new Map([...navLinks.entries()].filter(([linkId]) => linkId === id));

        linkUpdaters$.next([...linkUpdaters$.value, updater]);
      },

      update(id: string, values: ChromeNavLinkUpdateableFields) {
        if (!this.has(id)) {
          return;
        }

        const updater: LinksUpdater = (navLinks) =>
          new Map(
            [...navLinks.entries()].map(([linkId, link]) => {
              return [linkId, link.id === id ? link.update(values) : link] as [
                string,
                NavLinkWrapper
              ];
            })
          );

        linkUpdaters$.next([...linkUpdaters$.value, updater]);
        return this.get(id);
      },

      enableForcedAppSwitcherNavigation() {
        forceAppSwitcherNavigation$.next(true);
      },

      getForceAppSwitcherNavigation$() {
        return forceAppSwitcherNavigation$.asObservable();
      },
    };
  }

  public stop() {
    this.stop$.next();
  }
}

function sortNavLinks(navLinks: ReadonlyMap<string, NavLinkWrapper>) {
  return sortBy(
    [...navLinks.values()].map((link) => link.properties),
    'order'
  );
}
