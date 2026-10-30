/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/breadcrumb-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon } from "@lucide/solid";
import { Button } from "@solid2-aria/components";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../registry/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";
import { Link, useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      breadcrumb: "مسار التنقل",
      components: "المكونات",
      documentation: "التوثيق",
      github: "جيت هاب",
      home: "الرئيسية",
      themes: "السمات",
    },
  },
  en: {
    dir: "ltr",
    values: {
      breadcrumb: "Breadcrumb",
      components: "Components",
      documentation: "Documentation",
      github: "GitHub",
      home: "Home",
      themes: "Themes",
    },
  },
  he: {
    dir: "rtl",
    values: {
      breadcrumb: "פירורי לחם",
      components: "רכיבים",
      documentation: "תיעוד",
      github: "גיטהאב",
      home: "בית",
      themes: "ערכות נושא",
    },
  },
} satisfies Translations;

export function BreadcrumbRtl() {
  const { dir, t, language } = useTranslation(translations, "ar");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            render={(props) =>
              "href" in props ? (
                <Link class={props.class} />
              ) : (
                <span class={props.class} />
              )
            }
          >
            {t.home}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <DropdownMenuTrigger>
            <Button class="flex items-center gap-1">
              {t.components}
              <ChevronDownIcon data-icon="inline-end" class="size-3.5" />
            </Button>
            <DropdownMenu
              placement={dir === "rtl" ? "bottom end" : "bottom start"}
              data-lang={dir === "rtl" ? language : undefined}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem>{t.documentation}</DropdownMenuItem>
                <DropdownMenuItem>{t.themes}</DropdownMenuItem>
                <DropdownMenuItem>{t.github}</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbPage>{t.breadcrumb}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbRtl;
