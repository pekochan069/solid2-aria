/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/input-otp-controlled.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../registry/ui/input-otp";

export default function InputOTPControlled() {
  const [value, setValue] = createSignal("");

  return (
    <div class="space-y-2">
      <InputOTP
        maxLength={6}
        value={value()}
        onChange={(valueValue) => {
          setValue(valueValue);
        }}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div class="text-center text-sm">
        {value() === "" ? (
          <>Enter your one-time password.</>
        ) : (
          <>You entered: {value()}</>
        )}
      </div>
    </div>
  );
}
