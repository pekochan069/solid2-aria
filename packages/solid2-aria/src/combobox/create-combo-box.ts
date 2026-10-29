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
 * Derived from Adobe React Spectrum: packages/react-aria/src/combobox/useComboBox.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; compute localized announcements in tracking scopes before publishing them from effects.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { getChildNodes } from "@solid2-aria/stately/collections/get-child-nodes";
import { getItemCount } from "@solid2-aria/stately/collections/get-item-count";
import type {
  ComboBoxProps,
  ComboBoxState,
} from "@solid2-aria/stately/combobox/create-combo-box-state";
import { privateValidationStateProp } from "@solid2-aria/stately/form/create-form-validation-state";
import type { SelectionMode } from "@solid2-aria/stately/select/create-select-state";
import type {
  KeyboardEvent,
  AriaLabelingProps,
  DOMProps,
  InputDOMProps,
  KeyboardDelegate,
  LayoutDelegate,
  PressEvent,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, omit, createEffect, createMemo, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/combobox/index";
import type { AriaButtonProps } from "../button/create-button";
import { dispatchVirtualFocus } from "../focus/virtual-focus";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { setInteractionModality } from "../interactions/create-focus-visible";
import { createKeyboard } from "../interactions/create-keyboard";
import type { FieldAria } from "../label/create-field";
import type { AriaListBoxOptions } from "../listbox/create-list-box";
import { getItemId, listData } from "../listbox/utils";
import { announce } from "../live-announcer/live-announcer";
import { createMenuTrigger } from "../menu/create-menu-trigger";
import { ariaHideOutside } from "../overlays/aria-hide-outside";
import { createSelectableCollection } from "../selection/create-selectable-collection";
import { ListKeyboardDelegate } from "../selection/list-keyboard-delegate";
import { createTextField } from "../textfield/create-text-field";
import type {
  ElementType,
  FocusEvent,
  InputHTMLAttributes,
  TouchEvent,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { chain } from "../utils/chain";
import { createEvent } from "../utils/create-event";
import { createFormReset } from "../utils/create-form-reset";
import { createSlotId } from "../utils/create-id";
import { createLabels } from "../utils/create-labels";
import { getOwnerDocument } from "../utils/dom-helpers";
import { elementOrNull } from "../utils/dom-value";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { createRouter } from "../utils/open-link";
import { isAppleDevice } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import {
  getActiveElement,
  getEventTarget,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";

export interface AriaComboBoxProps<T, M extends SelectionMode = "single">
  extends ComboBoxProps<T, M>, DOMProps, InputDOMProps, AriaLabelingProps {
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean;
}

export interface AriaComboBoxOptions<
  T,
  M extends SelectionMode = "single",
> extends Omit<AriaComboBoxProps<T, M>, "children"> {
  /** The ref for the input element. */
  inputRef: Accessor<HTMLInputElement | null>;
  /** The ref for the list box popover. */
  popoverRef: Accessor<Element | null>;
  /** The ref for the list box. */
  listBoxRef: Accessor<HTMLElement | null>;
  /** The ref for the optional list box popup trigger button. */
  buttonRef?: Accessor<Element | null>;
  /**
   * The HTML element used to render the label, e.g. 'label', or 'span'.
   *
   * @default 'label'
   */
  labelElementType?: ElementType;
  /** An optional keyboard delegate implementation, to override the default. */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate;
}

export interface ComboBoxAria<T> extends ValidationResult {
  /** Props for the label element. */
  labelProps: FieldAria["labelProps"];
  /** Props for the combo box input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the list box, to be passed to `useListBox`. */
  listBoxProps: AriaListBoxOptions<T>;
  /** Props for the optional trigger button, to be passed to `useButton`. */
  buttonProps: AriaButtonProps;
  /** Props for the element representing the selected value. */
  valueProps: DOMAttributes;
  /** Props for the combo box description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the combo box error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a combo box component. A combo box
 * combines a text input with a listbox, allowing users to filter a list of options to items
 * matching a query.
 *
 * @param props - Props for the combo box.
 * @param state - State for the select, as returned by `useComboBoxState`.
 */
export function createComboBox<T, M extends SelectionMode = "single">(
  props: AriaComboBoxOptions<T, M>,
  state: ComboBoxState<T, M>
): ComboBoxAria<T> {
  const buttonRef = props.buttonRef ?? (() => null);

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/combobox"
  );

  const _result0 = createMenuTrigger<T>(
    {
      get isDisabled() {
        return getTruthyValue(props.isDisabled) ?? props.isReadOnly;
      },
      get type(): "listbox" {
        return "listbox";
      },
    },
    state,
    buttonRef
  );

  // Set listbox id so it can be used when calling getItemId later
  listData.set(state, {
    get id() {
      return _result0.menuProps.id;
    },
  });
  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  const _result1 = state;
  const _result2 = untrack(() => state.selectionManager);

  const delegate = createMemo(
    () =>
      getTruthyValue(props.keyboardDelegate) ??
      new ListKeyboardDelegate({
        collection: _result1.collection,
        disabledKeys: _result2.disabledKeys,
        layoutDelegate: props.layoutDelegate,
        ref: props.listBoxRef,
      })
  );

  // Use useSelectableCollection to get the keyboard handlers to apply to the textfield
  const _result3 = createSelectableCollection({
    get disallowEmptySelection(): true {
      return true;
    },
    get disallowTypeAhead(): true {
      return true;
    },
    // Prevent item scroll behavior from being applied here, should be handled in the user's Popover + ListBox component
    get isVirtualized(): true {
      return true;
    },
    get keyboardDelegate() {
      return delegate();
    },
    get ref() {
      return props.inputRef;
    },
    get selectionManager() {
      return state.selectionManager;
    },
    get shouldFocusWrap() {
      return props.shouldFocusWrap;
    },
  });

  const router = createRouter();

  // for textfield specific operations
  const _result4 = createKeyboard({
    get shortcuts() {
      return {
        Enter: (e: KeyboardEvent) => {
          const propslistBoxRefElement = props.listBoxRef();
          // Prevent default form submission if menu is open since we may be selecting a option
          const shouldPreventDefault = state.isOpen;

          // If the focused item is a link, trigger opening it. Items that are links are not selectable.
          if (
            state.isOpen &&
            propslistBoxRefElement &&
            state.selectionManager.focusedKey !== null &&
            state.selectionManager.focusedKey !== undefined
          ) {
            const collectionItem = state.collection.getItem(
              state.selectionManager.focusedKey
            );

            const collectionItemBehavior =
              getCollectionNodeProps(collectionItem);

            if (
              collectionItem !== null &&
              isTruthy(collectionItemBehavior.href)
            ) {
              const item = propslistBoxRefElement.querySelector(
                `[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`
              );

              if (item instanceof HTMLAnchorElement) {
                router.open(
                  item,
                  e,
                  collectionItemBehavior.href,
                  collectionItemBehavior.routerOptions
                );
              }

              state.close();

              return { shouldPreventDefault };
            } else if (
              collectionItem !== null &&
              isTruthy(collectionItemBehavior.onAction)
            ) {
              collectionItemBehavior.onAction();
              state.close();

              return { shouldPreventDefault };
            }
          }

          state.commit();

          return { shouldPreventDefault };
        },
        Escape: () => {
          let shouldContinuePropagation = false;

          if (
            !state.selectionManager.isEmpty ||
            state.inputValue === "" ||
            isTruthy(props.allowsCustomValue)
          ) {
            shouldContinuePropagation = true;
          }

          state.revert();

          return { shouldContinuePropagation };
        },
        Tab: () => {
          // If the focused item is a link, trigger opening it. Items that are links are not selectable.
          if (
            state.isOpen &&
            props.listBoxRef() &&
            state.selectionManager.focusedKey !== null &&
            state.selectionManager.focusedKey !== undefined
          ) {
            const collectionItem = state.collection.getItem(
              state.selectionManager.focusedKey
            );

            const collectionItemBehavior =
              getCollectionNodeProps(collectionItem);

            if (
              collectionItem !== null &&
              isTruthy(collectionItemBehavior.href)
            ) {
              state.close();

              return { shouldPreventDefault: false };
            } else if (
              collectionItem !== null &&
              isTruthy(collectionItemBehavior.onAction)
            ) {
              collectionItemBehavior.onAction();
              state.close();

              return {
                shouldContinuePropagation: true,
                shouldPreventDefault: false,
              };
            }
          }

          if (state.isOpen) {
            state.commit();
          }

          return {
            shouldContinuePropagation: true,
            shouldPreventDefault: false,
          };
        },
      };
    },
  });

  const _result5 = createKeyboard({
    get allowRepeats(): true {
      return true;
    },
    get shortcuts() {
      return {
        ArrowDown: () => {
          state.open("first", "manual");

          return { shouldPreventDefault: false };
        },
        ArrowLeft: () => {
          state.selectionManager.setFocusedKey(null);

          return { shouldPreventDefault: false };
        },
        ArrowRight: () => {
          state.selectionManager.setFocusedKey(null);

          return { shouldPreventDefault: false };
        },
        ArrowUp: () => {
          state.open("last", "manual");

          return { shouldPreventDefault: false };
        },
      };
    },
  });

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    const blurFromButton = nodeContains(
      buttonRef(),
      elementOrNull(e.relatedTarget)
    );

    const blurIntoPopover = nodeContains(
      props.popoverRef(),
      e.relatedTarget instanceof Node ? e.relatedTarget : null
    );

    // Ignore blur if focused moved to the button(if exists) or into the popover.
    if (blurFromButton || blurIntoPopover) {
      return;
    }

    if (props.onBlur) {
      props.onBlur(e);
    }

    state.setFocused(false);
  };

  const onFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (state.isFocused) {
      return;
    }

    if (props.onFocus) {
      props.onFocus(e);
    }

    state.setFocused(true);
  };

  const valueId = createSlotId(() => [
    state.selectionManager.selectedKeys,
    state.selectionManager.selectionMode,
  ]);

  const _result6 = createMemo(() => state.displayValidation);

  const _result7 = createTextField(
    merge(omit(props, "validate", "value", "defaultValue", "onChange"), {
      get "aria-describedby"() {
        return ariaValue(
          ariaValue(
            [valueId(), props["aria-describedby"]].filter(Boolean).join(" ") ||
              undefined
          )
        );
      },
      get autocomplete(): "off" {
        return "off";
      },
      get defaultValue() {
        return state.defaultInputValue;
      },
      // In multi-select mode, only set required if the selection is empty.
      get isRequired() {
        return props.selectionMode === "multiple"
          ? whenTruthy(props.isRequired, () => state.selectionManager.isEmpty)
          : props.isRequired;
      },
      get onBlur() {
        return onBlur;
      },
      get onChange() {
        return state.setInputValue;
      },
      get onFocus() {
        return onFocus;
      },
      get onKeyDown() {
        return isTruthy(props.isReadOnly)
          ? props.onKeyDown
          : chain(
              state.isOpen && _result3.collectionProps.onKeyDown,
              _result4.keyboardProps.onKeyDown,
              _result5.keyboardProps.onKeyDown,
              props.onKeyDown
            );
      },
      get [privateValidationStateProp]() {
        return state;
      },
      validate: undefined,
      get value() {
        return state.inputValue;
      },
    }),
    props.inputRef
  );

  createFormReset(
    () => props.inputRef(),
    () => state.defaultValue,
    state.setValue
  );

  // Press handlers for the ComboBox button
  const onPress = (e: PressEvent) => {
    if (e.pointerType === "touch") {
      // Focus the input field in case it isn't focused yet
      props.inputRef()?.focus();
      state.toggle(null, "manual");
    }
  };

  const onPressStart = (e: PressEvent) => {
    if (e.pointerType !== "touch") {
      props.inputRef()?.focus();
      state.toggle(
        e.pointerType === "keyboard" || e.pointerType === "virtual"
          ? "first"
          : null,
        "manual"
      );
    }
  };

  const triggerLabelProps = createLabels({
    get "aria-label"() {
      return ariaValue(ariaValue(stringFormatter.format("buttonLabel")));
    },
    get "aria-labelledby"() {
      return ariaValue(
        ariaValue(
          getTruthyValue(props["aria-labelledby"]) ?? _result7.labelProps.id
        )
      );
    },
    get id() {
      const { id } = _result0.menuTriggerProps;

      return typeof id === "string" ? id : undefined;
    },
  });

  const listBoxProps = createLabels({
    get "aria-label"() {
      return ariaValue(ariaValue(stringFormatter.format("listboxLabel")));
    },
    get "aria-labelledby"() {
      return ariaValue(
        ariaValue(
          getTruthyValue(props["aria-labelledby"]) ?? _result7.labelProps.id
        )
      );
    },
    get id() {
      return _result0.menuProps.id;
    },
  });

  // If a touch happens on direct center of ComboBox input, might be virtual click from iPad so open ComboBox menu
  let lastEventTime = 0;

  const onTouchEnd = (e: TouchEvent) => {
    if (isTruthy(props.isDisabled) || isTruthy(props.isReadOnly)) {
      return;
    }

    // Sometimes VoiceOver on iOS fires two touchend events in quick succession. Ignore the second one.
    if (e.timeStamp - lastEventTime < 500) {
      e.preventDefault();
      props.inputRef()?.focus();

      return;
    }

    const rect = getEventTarget(e).getBoundingClientRect();
    const [touch] = e.changedTouches;

    if (!touch) {
      return;
    }

    const centerX = Math.ceil(rect.left + 0.5 * rect.width);
    const centerY = Math.ceil(rect.top + 0.5 * rect.height);

    if (touch.clientX === centerX && touch.clientY === centerY) {
      e.preventDefault();
      props.inputRef()?.focus();
      state.toggle(null, "manual");
      lastEventTime = e.timeStamp;
    }
  };

  // VoiceOver announces per-item details natively, so only announce when entering a
  // new section, where it is silent.
  const focusedItem = createMemo(() =>
    isPresent(state.selectionManager.focusedKey) && state.isOpen
      ? state.collection.getItem(state.selectionManager.focusedKey)
      : undefined
  );

  const sectionKey = createMemo(() => focusedItem()?.parentKey ?? null);

  const itemKey = createMemo(() => state.selectionManager.focusedKey ?? null);

  let lastSection = untrack(sectionKey);
  let lastItem = untrack(itemKey);
  createEffect(
    () => {
      const currentItem = focusedItem();
      const currentItemKey = itemKey();
      const currentSectionKey = sectionKey();
      let announcement: string | undefined;

      if (
        isAppleDevice() &&
        currentItem &&
        currentItemKey !== null &&
        currentItemKey !== lastItem
      ) {
        const { collection } = state;

        const section =
          currentSectionKey === null
            ? null
            : collection.getItem(currentSectionKey);

        if (section && currentSectionKey !== lastSection) {
          announcement = stringFormatter.format("focusAnnouncement", {
            groupCount: [...getChildNodes(section, collection)].length,
            groupTitle:
              getTruthyValue(
                getTruthyValue(section["aria-label"]) ??
                  (typeof section.rendered === "string" ? section.rendered : "")
              ) ?? "",
            isGroupChange: true,
            isSelected: state.selectionManager.isSelected(currentItemKey),
            optionText:
              getTruthyValue(
                getTruthyValue(currentItem["aria-label"]) ??
                  currentItem.textValue
              ) ?? "",
          });
        }
      }

      return { announcement, currentItemKey, currentSectionKey };
    },
    ({ announcement, currentItemKey, currentSectionKey }) => {
      if (announcement !== undefined && announcement !== "") {
        announce(announcement);
      }

      lastSection = currentSectionKey;
      lastItem = currentItemKey;
    },
    { ssrSource: "client" }
  );
  // Announce the number of available suggestions when it changes.
  const optionCount = createMemo(() => getItemCount(state.collection));
  let lastSize = untrack(optionCount);
  let lastOpen = untrack(() => state.isOpen);
  createEffect(
    () => {
      const { isOpen } = state;
      const observedOptionCount = optionCount();

      // Other screen readers read the focused item's position automatically.
      const didOpenWithoutFocusedItem =
        isOpen !== lastOpen &&
        (!isPresent(state.selectionManager.focusedKey) || isAppleDevice());

      const announcement =
        isOpen &&
        (didOpenWithoutFocusedItem || observedOptionCount !== lastSize)
          ? stringFormatter.format("countAnnouncement", {
              optionCount: observedOptionCount,
            })
          : undefined;

      return { announcement, isOpen, observedOptionCount };
    },
    ({ announcement, isOpen, observedOptionCount }) => {
      if (announcement !== undefined && announcement !== "") {
        announce(announcement);
      }

      lastSize = observedOptionCount;
      lastOpen = isOpen;
    },
    { ssrSource: "client" }
  );
  // VoiceOver needs an explicit selection announcement.
  // Follow-up: do we need to do this for multi-select?
  let lastSelectedKey = untrack(() => getLegacyOption(state, "selectedKey"));
  createEffect(
    () => {
      const selectedItem = getLegacyOption(state, "selectedItem");
      const selectedKey = getLegacyOption(state, "selectedKey");

      const announcement =
        isAppleDevice() &&
        state.isFocused &&
        selectedItem &&
        selectedKey !== lastSelectedKey
          ? stringFormatter.format("selectedAnnouncement", {
              optionText:
                getTruthyValue(
                  getTruthyValue(selectedItem["aria-label"]) ??
                    selectedItem.textValue
                ) ?? "",
            })
          : undefined;

      return { announcement, selectedKey };
    },
    ({ announcement, selectedKey }) => {
      if (announcement !== undefined && announcement !== "") {
        announce(announcement);
      }

      lastSelectedKey = selectedKey;
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({
      inputElement: props.inputRef(),
      isOpen: state.isOpen,
      popoverElement: props.popoverRef(),
    }),
    ({ popoverElement, inputElement, isOpen }): undefined | (() => void) => {
      if (isOpen) {
        return ariaHideOutside(
          [inputElement, popoverElement].filter((element) => isPresent(element))
        );
      }

      return undefined;
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({ focusedItem: focusedItem(), inputElement: props.inputRef() }),
    ({ focusedItem: currentFocusedItem, inputElement }) => {
      const propsinputRefElement = inputElement;

      // Re-show focus ring when there is no virtually focused item.
      if (
        !currentFocusedItem &&
        propsinputRefElement &&
        getActiveElement(getOwnerDocument(propsinputRefElement)) ===
          propsinputRefElement
      ) {
        dispatchVirtualFocus(propsinputRefElement, null);
      }
    },
    { defer: true, ssrSource: "client" }
  );
  createEvent(props.listBoxRef, "react-aria-item-action", () => {
    if (state.isOpen) {
      state.close();
    }
  });

  return {
    get buttonProps() {
      const trigger = _result0.menuTriggerProps;

      return merge(triggerLabelProps, {
        get "aria-controls"() {
          const { id } = _result0.menuProps;

          return state.isOpen && typeof id === "string" ? id : undefined;
        },
        get "aria-expanded"() {
          return state.isOpen;
        },
        get "aria-haspopup"() {
          return "listbox" as const;
        },
        excludeFromTabOrder: true,
        get isDisabled() {
          return getTruthyValue(props.isDisabled) ?? props.isReadOnly;
        },
        onKeyDown: (event: KeyboardEvent) => trigger.onKeyDown?.(event),
        onKeyUp: (event: KeyboardEvent) => trigger.onKeyUp?.(event),
        onPress,
        onPressStart,
        preventFocusOnPress: true,
      });
    },
    get descriptionProps() {
      return _result7.descriptionProps;
    },
    get errorMessageProps() {
      return _result7.errorMessageProps;
    },
    get inputProps() {
      return mergeProps(_result7.inputProps, {
        "aria-activedescendant": ariaValue(
          focusedItem()
            ? getItemId(
                state,
                requireValue(focusedItem(), "Expected focusedItem()").key
              )
            : undefined
        ),
        // Follow-up: readd proper logic for completionMode = complete (aria-autocomplete: both)
        "aria-autocomplete": ariaValue("list"),
        "aria-controls": ariaValue(
          state.isOpen ? _result0.menuProps.id : undefined
        ),
        "aria-expanded": ariaValue(_result0.menuTriggerProps["aria-expanded"]),
        // This disable's iOS's autocorrect suggestions, since the combo box provides its own suggestions.
        autocorrect: "off",
        onTouchEnd,
        role: "combobox",
        // This disable's the macOS Safari spell check auto corrections.
        spellcheck: "false",
      });
    },
    get isInvalid() {
      return _result6().isInvalid;
    },
    get labelProps() {
      return merge(
        {
          get for() {
            const value =
              "for" in _result7.labelProps
                ? _result7.labelProps.for
                : undefined;

            return typeof value === "string" ? value : undefined;
          },
          get id() {
            const { id } = _result7.labelProps;

            return typeof id === "string" ? id : undefined;
          },
        },
        {
          // Focus the input in case the label is not a native <label> element.
          get onClick() {
            return ("for" in _result7.labelProps &&
              isTruthy(_result7.labelProps.for)) ||
              isTruthy(props.isDisabled)
              ? undefined
              : () => {
                  props.inputRef()?.focus();
                  setInteractionModality("keyboard");
                };
          },
        }
      );
    },
    get listBoxProps() {
      return mergeProps(_result0.menuProps, listBoxProps, {
        UNSTABLE_itemBehavior: "action" as const,
        autoFocus: getTruthyValue(state.focusStrategy) ?? true,
        linkBehavior: "selection" as const,
        onAction: undefined,
        shouldFocusOnHover: true,
        shouldSelectOnPressUp: true,
        shouldUseVirtualFocus: true,
      });
    },
    get validationDetails() {
      return _result6().validationDetails;
    },
    get validationErrors() {
      return _result6().validationErrors;
    },
    get valueProps() {
      return {
        get id() {
          return valueId();
        },
      };
    },
  };
}
