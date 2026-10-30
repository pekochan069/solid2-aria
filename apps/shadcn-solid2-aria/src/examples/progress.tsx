import { Progress } from "../registry/ui/progress";

export default function Example() {
  return (
    <div class="w-full max-w-xs space-y-3">
      <p class="text-muted-foreground text-sm">Your project is taking shape.</p>
      <Progress aria-label="Project completion" value={64} />
    </div>
  );
}
