import { Button } from "../registry/ui/button";

export default function Example() {
  return (
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button>Button</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button isDisabled>Disabled</Button>
    </div>
  );
}
