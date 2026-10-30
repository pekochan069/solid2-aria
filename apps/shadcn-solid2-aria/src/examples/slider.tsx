import { Slider } from "../registry/ui/slider";

export default function Example() {
  return (
    <div class="w-full max-w-xs">
      <Slider aria-label="Volume" defaultValue={45} maxValue={100} step={1} />
    </div>
  );
}
