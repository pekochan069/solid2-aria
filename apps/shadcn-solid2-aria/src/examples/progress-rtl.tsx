/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/progress-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "../registry/ui/progress";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      label: "تقدم الرفع",
    },
  },
  en: {
    dir: "ltr",
    values: {
      label: "Upload progress",
    },
  },
  he: {
    dir: "rtl",
    values: {
      label: "התקדמות העלאה",
    },
  },
} satisfies Translations;

function toArabicNumerals(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Math.trunc(Number(digit))])
    .join("");
}

export function ProgressRtl() {
  const { t, language } = useTranslation(translations, "ar");

  const formatNumber = (num: number): string => {
    if (language === "ar") {
      return toArabicNumerals(num);
    }

    return num.toString();
  };

  return (
    <Progress value={56} class="w-full max-w-sm">
      <ProgressLabel>{t.label}</ProgressLabel>
      <ProgressValue>
        {(value) => (
          <span class="ms-auto">{formatNumber(Number(value ?? "0"))}%</span>
        )}
      </ProgressValue>
    </Progress>
  );
}

export default ProgressRtl;
