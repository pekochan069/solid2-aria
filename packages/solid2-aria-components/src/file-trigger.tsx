/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/FileTrigger.tsx.
 * Modified for Solid Aria: adapted components, contexts, refs, and reactive properties for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { PressResponder } from "@solid2-aria/core/interactions/press-responder";
import { filterDOMProps } from "@solid2-aria/core/utils/filter-dom-props";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal } from "solid-js";

import { assignRef, dom } from "./utils";
import type { Ref } from "./utils";

export interface FileTriggerProps {
  acceptedFileTypes?: readonly string[];
  allowsMultiple?: boolean;
  defaultCamera?: "user" | "environment";
  onSelect?: (files: FileList | null) => void;
  children?: JSX.Element;
  acceptDirectory?: boolean;
  ref?: Ref<HTMLInputElement>;
  id?: string;
}

export function FileTrigger(props: FileTriggerProps): JSX.Element {
  const [ref, setRef] = createSignal<HTMLInputElement | null>(null, {
    ownedWrite: true,
  });

  return (
    <>
      <PressResponder
        onPress={() => {
          const input = ref();

          if (input) {
            input.value = "";
            input.click();
          }
        }}
      >
        {props.children}
      </PressResponder>
      <dom.input
        {...filterDOMProps(props, { global: true })}
        type="file"
        style={{ display: "none" }}
        ref={[
          (element: HTMLInputElement) => {
            setRef(element);
          },
          (element: HTMLInputElement) => {
            assignRef(
              untrack(() => props.ref),
              element
            );
          },
        ]}
        accept={props.acceptedFileTypes?.join(",")}
        multiple={props.allowsMultiple}
        capture={props.defaultCamera}
        webkitdirectory={props.acceptDirectory === true ? "" : undefined}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={(event) => props.onSelect?.(event.currentTarget.files)}
      />
    </>
  );
}
