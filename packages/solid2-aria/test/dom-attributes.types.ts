import type { DOMProps } from "@solid2-aria/types-shared";
import type {
  DOMAttributes,
  GlobalDOMAttributes,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

type Assert<T extends true> = T;

type DataAttributes = Pick<DOMProps, `data-${string}`>;

type JSXDataAttributes = Pick<JSX.HTMLAttributes<Element>, `data-${string}`>;

export type DOMAttributeContracts = [
  Assert<DataAttributes extends JSXDataAttributes ? true : false>,
  Assert<JSXDataAttributes extends DataAttributes ? true : false>,
  Assert<{ "data-value": object } extends DOMProps ? false : true>,
  Assert<
    DOMAttributes<HTMLElement> extends JSX.HTMLAttributes<HTMLElement>
      ? true
      : false
  >,
  Assert<
    DOMAttributes<SVGElement> extends JSX.SVGAttributes<SVGElement>
      ? true
      : false
  >,
  Assert<
    GlobalDOMAttributes<HTMLElement> extends JSX.HTMLAttributes<HTMLElement>
      ? true
      : false
  >,
];
