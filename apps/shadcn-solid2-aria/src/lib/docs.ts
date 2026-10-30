import { componentMetadata } from "./component-metadata";

export type ComponentName = keyof typeof componentMetadata;

export const components = Object.entries(componentMetadata)
  .map(([slug, item]) => ({
    ...item,
    href: `/docs/components/${slug}`,
    slug,
  }))
  .toSorted((left, right) => left.title.localeCompare(right.title));

interface Guide {
  slug: string;
  title: string;
  description: string;
  href: string;
}

export const guides: Guide[] = [
  {
    description: "Beautiful components. Solid foundations.",
    href: "/docs",
    slug: "introduction",
    title: "Introduction",
  },
  {
    description:
      "Choose your framework to create a Solid 2 app and install components.",
    href: "/docs/installation",
    slug: "installation",
    title: "Installation",
  },
  {
    description: "Make the components feel like your product.",
    href: "/docs/theming",
    slug: "theming",
    title: "Theming",
  },
  {
    description: "Adding dark mode to your site.",
    href: "/docs/dark-mode",
    slug: "dark-mode",
    title: "Dark Mode",
  },
  {
    description:
      "Keyboard interactions, focus management, and accessible names.",
    href: "/docs/accessibility",
    slug: "accessibility",
    title: "Accessibility",
  },
  {
    description: "Style rendered Markdown with your own typography settings.",
    href: "/docs/typeset",
    slug: "typeset",
    title: "Typeset",
  },
];

const installationGuides: Guide[] = [
  {
    description: "Install and configure shadcn/solid for Vite.",
    href: "/docs/installation/vite",
    slug: "installation/vite",
    title: "Vite",
  },
  {
    description: "Install and configure shadcn/solid for Vite with start mode.",
    href: "/docs/installation/vite-start",
    slug: "installation/vite-start",
    title: "Vite with start mode",
  },
  {
    description: "Install and configure shadcn/solid for TanStack Router.",
    href: "/docs/installation/tanstack-router",
    slug: "installation/tanstack-router",
    title: "TanStack Router",
  },
  {
    description: "Install and configure shadcn/solid for TanStack Start.",
    href: "/docs/installation/tanstack-start",
    slug: "installation/tanstack-start",
    title: "TanStack Start",
  },
];

const darkModeGuides: Guide[] = [
  {
    description: "Adding dark mode to your Vite app.",
    href: "/docs/dark-mode/vite",
    slug: "dark-mode/vite",
    title: "Vite",
  },
  {
    description: "Adding dark mode to your Vite with start mode app.",
    href: "/docs/dark-mode/vite-start",
    slug: "dark-mode/vite-start",
    title: "Vite with start mode",
  },
  {
    description: "Adding dark mode to your TanStack Router app.",
    href: "/docs/dark-mode/tanstack-router",
    slug: "dark-mode/tanstack-router",
    title: "TanStack Router",
  },
  {
    description: "Adding dark mode to your TanStack Start app.",
    href: "/docs/dark-mode/tanstack-start",
    slug: "dark-mode/tanstack-start",
    title: "TanStack Start",
  },
];

export const frameworkGuideGroups = [
  { pages: installationGuides, title: "Installation" },
  { pages: darkModeGuides, title: "Dark mode" },
];

export const allGuides = [...guides, ...installationGuides, ...darkModeGuides];

export const componentDocuments = components;

export const pages = [...allGuides, ...components];

const sources = import.meta.glob<string>("../components/ui/*.tsx", {
  import: "default",
  query: "?raw",
});

export function findComponent(slug: string) {
  return components.find((component) => component.slug === slug);
}

export async function loadComponentSource(slug: string) {
  const load = sources[`../components/ui/${slug}.tsx`];

  return load ? await load() : undefined;
}
