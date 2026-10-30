import { Spinner } from "../registry/ui/spinner";

export default function Example() {
  return (
    <div class="flex items-center gap-3">
      <Spinner />
      <span class="text-muted-foreground text-sm">Getting things ready...</span>
    </div>
  );
}
