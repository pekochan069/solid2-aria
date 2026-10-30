import { createEffect, createSignal, onSettled } from "solid-js";
import { mode, setMode } from "solid-mode-watcher";

export function ThemeWatcher() {
  const [ready, setReady] = createSignal(false);

  onSettled(() => {
    const stored = localStorage.getItem("ui-mode");
    setMode(
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system"
    );
    setReady(true);
  });

  createEffect(
    () => ({ ready: ready(), theme: mode() }),
    ({ ready: initialized, theme }): (() => void) | undefined => {
      if (!initialized) {
        return;
      }

      const media = window.matchMedia("(prefers-color-scheme: dark)");

      const updateTheme = () => {
        const dark = theme === "dark" || (theme === "system" && media.matches);
        const root = document.documentElement;
        root.classList.toggle("dark", dark);
        root.classList.toggle("light", !dark);
        root.dataset.theme = dark ? "catppuccin-macchiato" : "catppuccin-latte";
        root.style.colorScheme = dark ? "dark" : "light";
      };

      updateTheme();
      localStorage.setItem("ui-mode", theme);

      if (theme === "system") {
        media.addEventListener("change", updateTheme);
      }

      // oxlint-disable-next-line typescript/consistent-return -- Initialization creates the listener that needs cleanup.
      return () => {
        media.removeEventListener("change", updateTheme);
      };
    }
  );

  return null;
}
