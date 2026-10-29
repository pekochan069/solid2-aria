import type {
  AriaLabelingProps,
  DisabledBehavior,
  LinkDOMProps,
  PressEvents,
} from "@solid2-aria/types-shared";

interface CollectionNodeProps
  extends AriaLabelingProps, LinkDOMProps, PressEvents {
  "aria-errormessage"?: string;
  allowsSorting?: boolean;
  disabledBehavior?: DisabledBehavior;
  hasChildRows?: boolean;
  isDisabled?: boolean;
  isSelectionCell?: boolean;
  onAction?: () => void;
  UNSTABLE_childItems?: Iterable<unknown>;
}

/** Recover component behavior props after the collection erases their component type. */
export function getCollectionNodeProps(
  node: { props?: unknown } | null | undefined
): CollectionNodeProps {
  const props: unknown = node?.props;

  if (props === null || typeof props !== "object") {
    return {};
  }

  return props;
}
