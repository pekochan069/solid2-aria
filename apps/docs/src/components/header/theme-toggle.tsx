import { Match, Switch } from "solid-js";
import { mode, setMode } from "solid-mode-watcher";

import { Button } from "#components/ui/button";
import { MenuTrigger, Menu, MenuItem } from "#components/ui/menu";
import { LaptopIcon } from "#icons/runeicons/laptop";
import { MoonIcon } from "#icons/runeicons/moon";
import { SunIcon } from "#icons/runeicons/sun";

export function ThemeToggle() {
  return (
    <MenuTrigger>
      <Button aria-label="Change theme" size="icon" variant="ghost">
        <Switch>
          <Match when={mode() === "light"}>
            <SunIcon />
          </Match>
          <Match when={mode() === "dark"}>
            <MoonIcon />
          </Match>
          <Match when={mode() === "system"}>
            <LaptopIcon />
          </Match>
        </Switch>
      </Button>
      <Menu>
        <MenuItem
          onAction={() => {
            setMode("light");
          }}
        >
          <SunIcon />
          <span>Light</span>
        </MenuItem>
        <MenuItem
          onAction={() => {
            setMode("dark");
          }}
        >
          <MoonIcon />
          <span>Dark</span>
        </MenuItem>
        <MenuItem
          onAction={() => {
            setMode("system");
          }}
        >
          <LaptopIcon />
          <span>System</span>
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
