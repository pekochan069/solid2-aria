/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/rtl/components/appearance-settings.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive language and control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { ButtonGroup } from "../../../registry/ui/button-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "../../../registry/ui/field";
import { Input } from "../../../registry/ui/input";
import { RadioGroup, RadioGroupItem } from "../../../registry/ui/radio-group";
import { Switch } from "../../../registry/ui/switch";
import { IconMinus, IconPlus } from "./icons";
import { useLanguageContext } from "./language";

const translations = {
  ar: {
    computeDescription: "اختر بيئة الحوسبة لمجموعتك.",
    computeEnvironment: "بيئة الحوسبة",
    decrement: "إنقاص",
    dir: "rtl" as const,
    gpuDescription: "يمكنك إضافة المزيد لاحقًا.",
    increment: "زيادة",
    kubernetes: "كوبرنيتس",
    kubernetesDescription:
      "تشغيل أحمال عمل GPU على مجموعة مُهيأة بـ K8s. هذا هو الافتراضي.",
    numberOfGpus: "عدد وحدات GPU",
    virtualMachine: "جهاز افتراضي",
    vmDescription: "الوصول إلى مجموعة VM مُهيأة لتشغيل أحمال العمل. (قريبًا)",
    wallpaperDescription: "السماح بتلوين الخلفية.",
    wallpaperTinting: "تلوين الخلفية",
  },
  he: {
    computeDescription: "בחר את סביבת המחשוב לאשכול שלך.",
    computeEnvironment: "סביבת מחשוב",
    decrement: "הפחת",
    dir: "rtl" as const,
    gpuDescription: "תוכל להוסיף עוד מאוחר יותר.",
    increment: "הגדל",
    kubernetes: "קוברנטיס",
    kubernetesDescription:
      "הפעל עומסי עבודה של GPU באשכול מוגדר K8s. זו ברירת המחדל.",
    numberOfGpus: "מספר GPUs",
    virtualMachine: "מכונה וירטואלית",
    vmDescription: "גש לאשכול VM מוגדר להפעלת עומסי עבודה. (בקרוב)",
    wallpaperDescription: "אפשר לטפט להיצבע.",
    wallpaperTinting: "צביעת טפט",
  },
};

export function AppearanceSettings() {
  const context = useLanguageContext();
  const lang = () => (context?.language === "he" ? "he" : "ar");
  const t = () => translations[lang()];
  const [gpuCount, setGpuCount] = createSignal(8);

  const handleGpuAdjustment = (adjustment: number) => {
    setGpuCount((prevCount) =>
      Math.max(1, Math.min(99, prevCount + adjustment))
    );
  };

  const handleGpuInputChange = (
    e: Event & { currentTarget: HTMLInputElement }
  ) => {
    const value = Math.trunc(Number(e.currentTarget.value));

    if (!Number.isNaN(value) && value >= 1 && value <= 99) {
      setGpuCount(value);
    }
  };

  return (
    <div dir={t().dir}>
      <FieldSet>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>{t().computeEnvironment}</FieldLegend>
            <FieldDescription>{t().computeDescription}</FieldDescription>
            <RadioGroup defaultValue="kubernetes">
              <FieldLabel for="rtl-kubernetes">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t().kubernetes}</FieldTitle>
                    <FieldDescription>
                      {t().kubernetesDescription}
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value="kubernetes"
                    id="rtl-kubernetes"
                    aria-label={t().kubernetes}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel for="rtl-vm">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t().virtualMachine}</FieldTitle>
                    <FieldDescription>{t().vmDescription}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value="vm"
                    id="rtl-vm"
                    aria-label={t().virtualMachine}
                  />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel for="rtl-gpu-count">{t().numberOfGpus}</FieldLabel>
              <FieldDescription>{t().gpuDescription}</FieldDescription>
            </FieldContent>
            <ButtonGroup>
              <Input
                id="rtl-gpu-count"
                value={gpuCount()}
                onChange={handleGpuInputChange}
                size={3}
                class="h-7 w-14! font-mono"
                maxlength={3}
              />
              <Button
                variant="outline"
                size="icon-sm"
                type="button"
                aria-label={t().decrement}
                onPress={() => {
                  handleGpuAdjustment(-1);
                }}
                isDisabled={gpuCount() <= 1}
              >
                <IconMinus />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                type="button"
                aria-label={t().increment}
                onPress={() => {
                  handleGpuAdjustment(1);
                }}
                isDisabled={gpuCount() >= 99}
              >
                <IconPlus />
              </Button>
            </ButtonGroup>
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel for="rtl-tinting">{t().wallpaperTinting}</FieldLabel>
              <FieldDescription>{t().wallpaperDescription}</FieldDescription>
            </FieldContent>
            <Switch id="rtl-tinting" defaultSelected />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
