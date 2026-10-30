import { Switch } from "../registry/ui/switch";

export default function Example() {
  return (
    <div class="flex items-center gap-3">
      <Switch aria-label="Airplane mode" />
      <span class="text-sm">Airplane mode</span>
    </div>
  );
}
