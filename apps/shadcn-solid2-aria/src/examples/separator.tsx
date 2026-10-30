import { Separator } from "../registry/ui/separator";

export default function Example() {
  return (
    <div class="w-full max-w-xs space-y-4">
      <div>
        <p class="text-sm font-medium">Solid2 Aria</p>
        <p class="text-muted-foreground text-sm">
          The foundation for your interface.
        </p>
      </div>
      <Separator />
      <div class="flex h-4 items-center gap-4 text-sm">
        <span>Components</span>
        <Separator orientation="vertical" />
        <span>Documentation</span>
      </div>
    </div>
  );
}
