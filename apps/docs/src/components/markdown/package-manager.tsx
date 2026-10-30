import type { Accessor, ParentProps } from "solid-js";
import { createContext, createSignal, onSettled } from "solid-js";

export const packageManagers = ["npm", "yarn", "pnpm", "bun"] as const;

type PackageManager = (typeof packageManagers)[number];

const storageKey = "package-manager";

export const PackageManagerContext = createContext<{
  selected: Accessor<PackageManager>;
  select: (packageManager: PackageManager) => void;
}>();

export function PackageManagerProvider(props: ParentProps) {
  const [selected, setSelected] = createSignal<PackageManager>("npm");

  onSettled(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const packageManager = packageManagers.find((value) => value === stored);

      if (packageManager) {
        setSelected(packageManager);
      }
    } catch {
      // Keep the default when browser storage is unavailable.
    }
  });

  function select(packageManager: PackageManager) {
    setSelected(packageManager);

    try {
      localStorage.setItem(storageKey, packageManager);
    } catch {
      // The shared selection still works when browser storage is unavailable.
    }
  }

  return (
    <PackageManagerContext value={{ select, selected }}>
      {props.children}
    </PackageManagerContext>
  );
}
