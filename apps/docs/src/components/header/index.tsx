import { Header as HeaderComponent } from "@solid2-aria/components/header";
import { Link } from "@tanstack/solid-router";

import { buttonVariants } from "#components/ui";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <HeaderComponent id="site-header" class="sticky top-0 z-50">
      <div class="container mx-auto flex h-16 w-full items-center justify-between">
        <nav>
          <Link to="/" class={buttonVariants({ size: "lg", variant: "ghost" })}>
            Solid2 Aria
          </Link>
        </nav>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </HeaderComponent>
  );
}
