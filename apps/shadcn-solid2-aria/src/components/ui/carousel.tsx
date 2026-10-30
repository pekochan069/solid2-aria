/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/carousel.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronLeftIcon, ChevronRightIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import EmblaCarousel from "embla-carousel";
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from "embla-carousel";
import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onSettled,
  omit,
} from "solid-js";

import { Button } from "./button";

type CarouselApi = EmblaCarouselType;

type CarouselProps = ComponentProps<"div"> & {
  opts?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

interface CarouselContextValue {
  orientation: "horizontal" | "vertical";
  carouselRef: (element: HTMLDivElement) => void;
  api: CarouselApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = createContext<CarouselContextValue>();

function useCarousel() {
  return useContext(CarouselContext);
}

function Carousel(props: CarouselProps) {
  const [viewport, setViewport] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const [api, setApi] = createSignal<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = createSignal(false);
  const [canScrollNext, setCanScrollNext] = createSignal(false);

  const orientation = () =>
    props.orientation ?? (props.opts?.axis === "y" ? "vertical" : "horizontal");

  const options = () => ({
    ...props.opts,
    axis: orientation() === "horizontal" ? ("x" as const) : ("y" as const),
  });

  onSettled(() => {
    const element = viewport();
    let cleanup: (() => void) | undefined;

    if (element) {
      const initialInstance = EmblaCarousel(element, options(), props.plugins);

      const update = () => {
        setCanScrollPrev(initialInstance.canScrollPrev());
        setCanScrollNext(initialInstance.canScrollNext());
      };

      initialInstance.on("select", update).on("reInit", update);
      update();
      setApi(initialInstance);
      props.setApi?.(initialInstance);

      cleanup = () => {
        initialInstance.destroy();
      };
    }

    return cleanup;
  });
  createEffect(
    () => ({ api: api(), options: options() }),
    (next) => {
      next.api?.reInit(next.options);
    }
  );

  const context: CarouselContextValue = {
    get api() {
      return api();
    },
    get canScrollNext() {
      return canScrollNext();
    },
    get canScrollPrev() {
      return canScrollPrev();
    },
    carouselRef: (element) => {
      setViewport(element);
    },
    get orientation() {
      return orientation();
    },
    scrollNext: () => api()?.scrollNext(),
    scrollPrev: () => api()?.scrollPrev(),
  };

  const rest = omit(
    props,
    "opts",
    "plugins",
    "orientation",
    "setApi",
    "class",
    "children",
    "onKeyDown"
  );

  return (
    <CarouselContext value={context}>
      <div
        {...rest}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        class={cn("relative", props.class)}
        onKeyDown={(event) => {
          if (typeof props.onKeyDown === "function") {
            props.onKeyDown(event);
          }

          if (
            event.defaultPrevented ||
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
          ) {
            return;
          }

          const previous =
            orientation() === "horizontal" ? "ArrowLeft" : "ArrowUp";

          const next =
            orientation() === "horizontal" ? "ArrowRight" : "ArrowDown";

          if (event.key === previous) {
            event.preventDefault();
            context.scrollPrev();
          }

          if (event.key === next) {
            event.preventDefault();
            context.scrollNext();
          }
        }}
      >
        {props.children}
      </div>
    </CarouselContext>
  );
}

function CarouselContent(props: ComponentProps<"div">) {
  const context = useCarousel();
  const rest = omit(props, "class");

  return (
    <div
      ref={context.carouselRef}
      class="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        {...rest}
        class={cn(
          "flex",
          context.orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          props.class
        )}
      />
    </div>
  );
}

function CarouselItem(props: ComponentProps<"div">) {
  const context = useCarousel();

  return (
    <div
      {...props}
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      class={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        context.orientation === "horizontal" ? "pl-4" : "pt-4",
        props.class
      )}
    />
  );
}

function CarouselPrevious(props: ComponentProps<typeof Button>) {
  const context = useCarousel();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      {...props}
      data-slot="carousel-previous"
      class={cn(
        "absolute touch-manipulation rounded-full",
        context.orientation === "horizontal"
          ? "inset-y-0 -left-12 my-auto"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        props.class
      )}
      isDisabled={!context.canScrollPrev || props.isDisabled}
      onPress={(event) => {
        props.onPress?.(event);
        context.scrollPrev();
      }}
    >
      <ChevronLeftIcon />
      <span class="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext(props: ComponentProps<typeof Button>) {
  const context = useCarousel();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      {...props}
      data-slot="carousel-next"
      class={cn(
        "absolute touch-manipulation rounded-full",
        context.orientation === "horizontal"
          ? "inset-y-0 -right-12 my-auto"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        props.class
      )}
      isDisabled={!context.canScrollNext || props.isDisabled}
      onPress={(event) => {
        props.onPress?.(event);
        context.scrollNext();
      }}
    >
      <ChevronRightIcon />
      <span class="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
