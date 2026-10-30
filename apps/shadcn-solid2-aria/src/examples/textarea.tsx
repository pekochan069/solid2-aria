import { Textarea } from "../registry/ui/textarea";

export default function Example() {
  return (
    <div class="w-full max-w-sm space-y-2">
      <label for="example-message" class="text-sm font-medium">
        Your message
      </label>
      <Textarea
        id="example-message"
        placeholder="Tell us what you’re working on..."
      />
    </div>
  );
}
