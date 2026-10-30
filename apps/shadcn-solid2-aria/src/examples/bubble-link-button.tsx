/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/bubble-link-button.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

// Mount <Toaster /> once at the application root.
import { Bubble, BubbleContent, BubbleGroup } from "../registry/ui/bubble";
import { toast } from "../registry/ui/sonner";

export function BubbleLinkButtonDemo() {
  return (
    <div class="flex w-full max-w-sm flex-col gap-8 py-12">
      <Bubble variant="muted">
        <BubbleContent>How can I help you today?</BubbleContent>
      </Bubble>
      <BubbleGroup>
        <Bubble variant="tinted" align="end">
          <BubbleContent
            render={(props) => (
              <button
                onClick={() => {
                  toast("You clicked forgot password");
                }}
                class={props.class}
              />
            )}
          >
            I forgot my password
          </BubbleContent>
        </Bubble>
        <Bubble variant="tinted" align="end">
          <BubbleContent
            render={(props) => (
              <button
                onClick={() => {
                  toast("You clicked help with subscription");
                }}
                class={props.class}
              />
            )}
          >
            I need help with my subscription
          </BubbleContent>
        </Bubble>
        <Bubble variant="tinted" align="end">
          <BubbleContent
            render={(props) => (
              <button
                onClick={() => {
                  toast("You clicked something else. Talk to a human.");
                }}
                class={props.class}
              />
            )}
          >
            Something else. Talk to a human.
          </BubbleContent>
        </Bubble>
      </BubbleGroup>
    </div>
  );
}

export default BubbleLinkButtonDemo;
