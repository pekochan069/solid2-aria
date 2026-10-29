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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/DismissButton.tsx.
 * Modified for Solid Aria: adapted components, imports, and reactive lifecycle for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import intlMessages from "../../intl/overlays";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createLabels } from "../utils/create-labels";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

export interface DismissButtonProps extends AriaLabelingProps, DOMProps {
  onDismiss?: () => void;
}

export function DismissButton(props: DismissButtonProps): JSX.Element {
  const formatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/overlays"
  );

  const labels = createLabels(omit(props, "onDismiss"), () =>
    formatter.format("dismiss")
  );

  return (
    <VisuallyHidden>
      <button
        {...labels}
        tabindex={-1}
        onClick={() => props.onDismiss?.()}
        style={{ height: "1px", width: "1px" }}
      />
    </VisuallyHidden>
  );
}
