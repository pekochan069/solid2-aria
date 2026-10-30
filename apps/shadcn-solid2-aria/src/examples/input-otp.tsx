import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../registry/ui/input-otp";

export default function Example() {
  return (
    <InputOTP aria-label="Verification code" maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
