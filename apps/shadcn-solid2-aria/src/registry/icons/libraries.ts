export const iconLibraries = {
  lucide: {
    export: "@lucide/solid",
    import: 'import { ICON } from "@lucide/solid";',
    name: "lucide",
    packages: ["@lucide/solid"],
    title: "Lucide",
    usage: "<ICON />",
  },
};

export type IconLibraries = typeof iconLibraries;

export type IconLibrary = IconLibraries[keyof IconLibraries];

export type IconLibraryName = keyof IconLibraries;
