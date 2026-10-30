import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../registry/ui/collapsible";

export default function Example() {
  return (
    <Collapsible class="w-full max-w-xs">
      <CollapsibleTrigger>Show project details</CollapsibleTrigger>
      <CollapsibleContent>
        <p class="text-muted-foreground mt-3 rounded-lg border p-4 text-sm">
          Built with Solid 2, Solid2 Aria, and Tailwind CSS.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
