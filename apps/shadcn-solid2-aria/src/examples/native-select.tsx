import { NativeSelect, NativeSelectOption } from "../registry/ui/native-select";

export default function Example() {
  return (
    <NativeSelect aria-label="Choose a framework">
      <NativeSelectOption value="solid">Solid 2</NativeSelectOption>
      <NativeSelectOption value="astro">Astro</NativeSelectOption>
      <NativeSelectOption value="start">TanStack Start</NativeSelectOption>
    </NativeSelect>
  );
}
