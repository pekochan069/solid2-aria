import type { ColumnSize } from "../table/column";

interface NodeMetadata {
  allowsSorting?: unknown;
  children?: unknown;
  UNSTABLE_childItems?: unknown;
  colSpan?: unknown;
  href?: unknown;
  defaultWidth?: unknown;
  disabledBehavior?: unknown;
  isDisabled?: unknown;
  isDragButtonCell?: unknown;
  isLoading?: unknown;
  isRowHeader?: unknown;
  isSelectionCell?: unknown;
  maxWidth?: unknown;
  minWidth?: unknown;
  width?: unknown;
}

function isColumnSize(value: string | number): value is ColumnSize {
  return (
    typeof value === "number" ||
    (typeof value === "string" &&
      /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:%|fr)?$/iu.test(value))
  );
}

function columnSize(
  metadata: NodeMetadata,
  key: "width" | "defaultWidth" | "minWidth" | "maxWidth"
): ColumnSize | undefined {
  const value = metadata[key];

  return (typeof value === "string" || typeof value === "number") &&
    isColumnSize(value)
    ? value
    : undefined;
}

/** Read the built-in metadata at the boundary of the extensible Node.props contract. */
export function getNodeProps(node: { props?: unknown } | null | undefined) {
  const metadata: unknown = node?.props;

  const props: NodeMetadata =
    typeof metadata === "object" && metadata !== null ? metadata : {};

  const children: unknown = props.children;
  const childItems = props.UNSTABLE_childItems;
  const { colSpan } = props;
  const { href } = props;

  return {
    allowsSorting: props.allowsSorting === true,
    children: Array.isArray(children) ? children.length : 0,
    colSpan: typeof colSpan === "number" ? colSpan : undefined,
    defaultWidth: columnSize(props, "defaultWidth"),
    disabledBehavior: props.disabledBehavior,
    hasChildItems: childItems !== null && childItems !== undefined,
    href: typeof href === "string" ? href : undefined,
    isDisabled: props.isDisabled === true,
    isDragButtonCell: props.isDragButtonCell === true,
    isLoading: props.isLoading === true,
    isRowHeader: props.isRowHeader === true,
    isSelectionCell: props.isSelectionCell === true,
    maxWidth: columnSize(props, "maxWidth"),
    minWidth: columnSize(props, "minWidth"),
    width: columnSize(props, "width"),
  };
}
