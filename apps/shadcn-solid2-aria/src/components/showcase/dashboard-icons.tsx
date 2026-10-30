/**
 * @license @tabler/icons-react v3.34.1 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright (c) 2020-2024 Paweł Kuna
 * Derived from Tabler Icons (https://github.com/tabler/tabler-icons): @tabler/icons-react/dist/esm/icons/{IconInnerShadowTop,IconDashboard,IconListDetails,IconChartBar,IconFolder,IconUsers,IconDatabase,IconReport,IconFileWord,IconSettings,IconHelp,IconDots,IconTrendingUp,IconTrendingDown,IconCirclePlusFilled}.mjs.
 * Modified for Solid Aria: retain SVG node data and render with native Solid 2 SVG components.
 * Licensed under MIT. See ../../../LICENSES/tabler-icons-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";

import { HugeIcon } from "../huge-icon";

const icons = {
  analytics: [
    [
      "path",
      {
        d: "M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        key: "svg-0",
      },
    ],
    [
      "path",
      {
        d: "M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        key: "svg-1",
      },
    ],
    [
      "path",
      {
        d: "M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        key: "svg-2",
      },
    ],
    ["path", { d: "M4 20h14", key: "svg-3" }],
  ],
  brand: [
    [
      "path",
      {
        d: "M5.636 5.636a9 9 0 1 0 12.728 12.728a9 9 0 0 0 -12.728 -12.728z",
        key: "svg-0",
      },
    ],
    ["path", { d: "M16.243 7.757a6 6 0 0 0 -8.486 0", key: "svg-1" }],
  ],
  dashboard: [
    ["path", { d: "M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", key: "svg-0" }],
    ["path", { d: "M13.45 11.55l2.05 -2.05", key: "svg-1" }],
    ["path", { d: "M6.4 20a9 9 0 1 1 11.2 0z", key: "svg-2" }],
  ],
  database: [
    ["path", { d: "M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0", key: "svg-0" }],
    ["path", { d: "M4 6v6a8 3 0 0 0 16 0v-6", key: "svg-1" }],
    ["path", { d: "M4 12v6a8 3 0 0 0 16 0v-6", key: "svg-2" }],
  ],
  down: [
    ["path", { d: "M3 7l6 6l4 -4l8 8", key: "svg-0" }],
    ["path", { d: "M21 10l0 7l-7 0", key: "svg-1" }],
  ],
  help: [
    ["path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", key: "svg-0" }],
    ["path", { d: "M12 17l0 .01", key: "svg-1" }],
    [
      "path",
      { d: "M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4", key: "svg-2" },
    ],
  ],
  lifecycle: [
    ["path", { d: "M13 5h8", key: "svg-0" }],
    ["path", { d: "M13 9h5", key: "svg-1" }],
    ["path", { d: "M13 15h8", key: "svg-2" }],
    ["path", { d: "M13 19h5", key: "svg-3" }],
    [
      "path",
      {
        d: "M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        key: "svg-4",
      },
    ],
    [
      "path",
      {
        d: "M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z",
        key: "svg-5",
      },
    ],
  ],
  more: [
    ["path", { d: "M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", key: "svg-0" }],
    ["path", { d: "M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", key: "svg-1" }],
    ["path", { d: "M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", key: "svg-2" }],
  ],
  plus: [
    [
      "path",
      {
        d: "M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z",
        key: "svg-0",
      },
    ],
  ],
  projects: [
    [
      "path",
      {
        d: "M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2",
        key: "svg-0",
      },
    ],
  ],
  reports: [
    [
      "path",
      { d: "M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697", key: "svg-0" },
    ],
    ["path", { d: "M18 14v4h4", key: "svg-1" }],
    ["path", { d: "M18 11v-4a2 2 0 0 0 -2 -2h-2", key: "svg-2" }],
    [
      "path",
      {
        d: "M8 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z",
        key: "svg-3",
      },
    ],
    ["path", { d: "M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", key: "svg-4" }],
    ["path", { d: "M8 11h4", key: "svg-5" }],
    ["path", { d: "M8 15h3", key: "svg-6" }],
  ],
  settings: [
    [
      "path",
      {
        d: "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z",
        key: "svg-0",
      },
    ],
    ["path", { d: "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0", key: "svg-1" }],
  ],
  team: [
    ["path", { d: "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", key: "svg-0" }],
    ["path", { d: "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2", key: "svg-1" }],
    ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "svg-2" }],
    ["path", { d: "M21 21v-2a4 4 0 0 0 -3 -3.85", key: "svg-3" }],
  ],
  up: [
    ["path", { d: "M3 17l6 -6l4 4l8 -8", key: "svg-0" }],
    ["path", { d: "M14 7l7 0l0 7", key: "svg-1" }],
  ],
  word: [
    ["path", { d: "M14 3v4a1 1 0 0 0 1 1h4", key: "svg-0" }],
    [
      "path",
      {
        d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2",
        key: "svg-1",
      },
    ],
    ["path", { d: "M9 12l1.333 5l1.667 -4l1.667 4l1.333 -5", key: "svg-2" }],
  ],
} satisfies Record<string, ComponentProps<typeof HugeIcon>["icon"]>;

export function DashboardIcon(props: {
  name: keyof typeof icons;
  size?: number;
}) {
  return (
    <HugeIcon
      icon={icons[props.name]}
      size={props.size ?? 16}
      stroke={props.name === "plus" ? "none" : "currentColor"}
      fill={props.name === "plus" ? "currentColor" : "none"}
      stroke-width={2}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  );
}
