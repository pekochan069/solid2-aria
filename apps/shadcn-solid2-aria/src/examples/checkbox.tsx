import { Checkbox } from "../registry/ui/checkbox";

export default function Example() {
  return (
    <div class="flex items-center gap-3">
      <Checkbox aria-label="Accept terms and conditions" />
      <span class="text-sm">Accept terms and conditions</span>
    </div>
  );
}
