import { AspectRatio } from "../registry/ui/aspect-ratio";

export default function Example() {
  return (
    <div class="w-full max-w-sm overflow-hidden rounded-lg">
      <AspectRatio ratio={16 / 9}>
        <div class="bg-muted flex h-full items-center justify-center">
          <span class="text-muted-foreground text-sm">16 : 9</span>
        </div>
      </AspectRatio>
    </div>
  );
}
