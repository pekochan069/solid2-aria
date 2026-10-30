/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-otp-invalid.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../registry/ui/input-otp";

export function InputOTPInvalid() {
  const [value, setValue] = createSignal("000000");

  return (
    <InputOTP
      maxLength={6}
      value={value()}
      onChange={(valueValue) => {
        setValue(valueValue);
      }}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} aria-invalid="true" />
        <InputOTPSlot index={1} aria-invalid="true" />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} aria-invalid="true" />
        <InputOTPSlot index={3} aria-invalid="true" />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={4} aria-invalid="true" />
        <InputOTPSlot index={5} aria-invalid="true" />
      </InputOTPGroup>
    </InputOTP>
  );
}

export default InputOTPInvalid;
