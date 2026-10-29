/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-aria/src/breadcrumbs/useBreadcrumbs.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { omit, merge } from "solid-js";

import intlMessages from "../../intl/breadcrumbs/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { getTruthyValue } from "../utils/truthy";

export interface AriaBreadcrumbsProps extends DOMProps, AriaLabelingProps {}

export interface BreadcrumbsAria {
  /** Props for the breadcrumbs navigation element. */
  navProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a breadcrumbs component.
 * Breadcrumbs display a hierarchy of links to the current page or resource in an application.
 */
export function createBreadcrumbs(
  props: AriaBreadcrumbsProps
): BreadcrumbsAria {
  const strings = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/breadcrumbs"
  );

  return {
    get navProps() {
      return merge(
        filterDOMProps(omit(props, "aria-label"), { labelable: true }),
        {
          get "aria-label"() {
            return ariaValue(
              ariaValue(
                getTruthyValue(props["aria-label"]) ??
                  strings.format("breadcrumbs")
              )
            );
          },
        }
      );
    },
  };
}
