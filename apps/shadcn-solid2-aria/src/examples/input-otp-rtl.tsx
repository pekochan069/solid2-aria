/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-otp-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Field, FieldLabel } from "../registry/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../registry/ui/input-otp";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      verificationCode: "رمز التحقق",
    },
  },
  en: {
    dir: "ltr",
    values: {
      verificationCode: "Verification code",
    },
  },
  he: {
    dir: "rtl",
    values: {
      verificationCode: "קוד אימות",
    },
  },
} satisfies Translations;

export function InputOTPRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Field class="mx-auto max-w-xs">
      <FieldLabel for="input-otp-rtl">{t.verificationCode}</FieldLabel>
      <InputOTP maxLength={6} defaultValue="123456" id="input-otp-rtl">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </Field>
  );
}

export default InputOTPRtl;
