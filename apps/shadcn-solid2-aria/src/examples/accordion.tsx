import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../registry/ui/accordion";

export default function Example() {
  return (
    <Accordion class="w-full max-w-sm">
      <AccordionItem id="accessible">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. Keyboard navigation, focus management, and screen reader
          semantics come from Solid2 Aria.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="styled">
        <AccordionTrigger>Can I customize it?</AccordionTrigger>
        <AccordionContent>
          The component source is yours. Change the Tailwind classes and theme
          tokens to make it your own.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="solid">
        <AccordionTrigger>Does it use Solid 2?</AccordionTrigger>
        <AccordionContent>
          Yes. These components use native Solid 2 signals, reactive props, and
          JSX.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
