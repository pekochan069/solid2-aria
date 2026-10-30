/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/sidebar-nav.tsx.
 * Modified for Solid Aria: Solid 2 selection state, native navigation buttons, and upstream Hugeicons SVGs.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import ActivityIcon from "@hugeicons/core-free-icons/Activity01Icon";
import Analytics01Icon from "@hugeicons/core-free-icons/Analytics01Icon";
import AnalyticsUpIcon from "@hugeicons/core-free-icons/AnalyticsUpIcon";
import ArrowDataTransferHorizontalIcon from "@hugeicons/core-free-icons/ArrowDataTransferHorizontalIcon";
import BankIcon from "@hugeicons/core-free-icons/BankIcon";
import BookOpen02Icon from "@hugeicons/core-free-icons/BookOpen02Icon";
import Calendar03Icon from "@hugeicons/core-free-icons/Calendar03Icon";
import ChartBarLineIcon from "@hugeicons/core-free-icons/ChartBarLineIcon";
import CreditCardIcon from "@hugeicons/core-free-icons/CreditCardIcon";
import File02Icon from "@hugeicons/core-free-icons/File02Icon";
import Globe02Icon from "@hugeicons/core-free-icons/Globe02Icon";
import HelpCircleIcon from "@hugeicons/core-free-icons/HelpCircleIcon";
import Message01Icon from "@hugeicons/core-free-icons/Message01Icon";
import Notification03Icon from "@hugeicons/core-free-icons/Notification03Icon";
import PaintBoardIcon from "@hugeicons/core-free-icons/PaintBoardIcon";
import PieChartIcon from "@hugeicons/core-free-icons/PieChartIcon";
import ShieldIcon from "@hugeicons/core-free-icons/Shield01Icon";
import Target02Icon from "@hugeicons/core-free-icons/Target02Icon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import Wallet01Icon from "@hugeicons/core-free-icons/Wallet01Icon";
import { createSignal, For } from "solid-js";

import { Card } from "../../registry/ui/card";
import { HugeIcon } from "../huge-icon";

const sections = [
  {
    active: "Analytics",
    items: [
      { icon: Analytics01Icon, label: "Analytics" },
      { icon: ArrowDataTransferHorizontalIcon, label: "Transactions" },
      { icon: AnalyticsUpIcon, label: "Investments" },
      { icon: BankIcon, label: "Accounts" },
      { icon: PieChartIcon, label: "Spending" },
    ],
    label: "Overview",
  },
  {
    active: "",
    items: [
      { icon: File02Icon, label: "Documents" },
      { icon: Wallet01Icon, label: "Budget" },
      { icon: ChartBarLineIcon, label: "Reports" },
      { icon: Target02Icon, label: "Goals" },
      { icon: Calendar03Icon, label: "Calendar" },
    ],
    label: "Planning",
  },
  {
    active: "",
    items: [
      { icon: HelpCircleIcon, label: "Help Center" },
      { icon: BookOpen02Icon, label: "Docs" },
      { icon: Message01Icon, label: "Contact Us" },
      { icon: ActivityIcon, label: "Status" },
      { icon: Globe02Icon, label: "Community" },
    ],
    label: "Support",
  },
  {
    active: "Billing",
    items: [
      { icon: UserIcon, label: "Profile" },
      { icon: CreditCardIcon, label: "Billing" },
      { icon: Notification03Icon, label: "Notifications" },
      { icon: ShieldIcon, label: "Security" },
      { icon: PaintBoardIcon, label: "Appearance" },
    ],
    label: "Account",
  },
];

export function SidebarNav() {
  const [selected, setSelected] = createSignal<Record<string, string>>({
    Account: "Billing",
    Overview: "Analytics",
  });

  return (
    <div class="demo-sidebars">
      <For each={sections}>
        {(section) => (
          <Card class="demo-sidebar" data-section={section.label}>
            <h2>{section.label}</h2>
            <nav aria-label={`${section.label} example`}>
              <For each={section.items}>
                {(item) => (
                  <button
                    type="button"
                    aria-pressed={
                      selected()[section.label] === item.label
                        ? "true"
                        : "false"
                    }
                    onClick={() => {
                      setSelected((previous) => ({
                        ...previous,
                        [section.label]: item.label,
                      }));
                    }}
                  >
                    <HugeIcon icon={item.icon} size={16} />
                    <span>{item.label}</span>
                  </button>
                )}
              </For>
            </nav>
          </Card>
        )}
      </For>
    </div>
  );
}
