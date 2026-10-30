import { Kbd, KbdGroup } from "../registry/ui/kbd";

export default function Example() {
  return (
    <div class="text-muted-foreground flex items-center gap-3 text-sm">
      Open search
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  );
}
