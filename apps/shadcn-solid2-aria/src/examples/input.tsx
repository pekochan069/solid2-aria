import { Input } from "../registry/ui/input";

export default function Example() {
  return (
    <div class="w-full max-w-xs space-y-2">
      <label for="example-email" class="text-sm font-medium">
        Email address
      </label>
      <Input id="example-email" type="email" placeholder="you@example.com" />
    </div>
  );
}
