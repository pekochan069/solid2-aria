import { Skeleton } from "../registry/ui/skeleton";

export default function Example() {
  return (
    <div
      class="flex w-full max-w-xs items-center gap-4"
      role="status"
      aria-label="Loading profile"
    >
      <Skeleton class="size-12 rounded-full" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-4 w-full" />
      </div>
    </div>
  );
}
