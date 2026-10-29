/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/TableLayout.ts.
 * Modified for Solid Aria: locale and column sizing use Solid reactive contexts.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { TableLayout as BaseTableLayout } from "@solid2-aria/stately/layout/table-layout";
import type { TableLayoutProps } from "@solid2-aria/stately/layout/table-layout";
import { useContext } from "solid-js";

import { TableColumnResizeStateContext } from "./table";
import type { LayoutOptionsDelegate } from "./virtualizer";

export class TableLayout<T, O extends TableLayoutProps = TableLayoutProps>
  extends BaseTableLayout<T, O>
  implements LayoutOptionsDelegate<TableLayoutProps>
{
  createLayoutOptions(): TableLayoutProps {
    const state = useContext(TableColumnResizeStateContext);

    return {
      get columnWidths() {
        return state?.columnWidths;
      },
    };
  }
}
