/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/attachment-image.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { XIcon } from "@lucide/solid";
import { For } from "solid-js";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "../registry/ui/attachment";

const images = [
  {
    alt: "Workspace",
    meta: "PNG · 820 KB",
    name: "workspace.png",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
  },
  {
    alt: "Desk",
    meta: "JPG · 1.1 MB",
    name: "desk-reference.jpg",
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80",
  },
  {
    alt: "Office",
    meta: "JPG · 940 KB",
    name: "office-reference.jpg",
    src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80",
  },
];

export function AttachmentImage() {
  return (
    <div class="mx-auto w-full max-w-sm py-12">
      <AttachmentGroup class="w-full">
        {
          <For each={images}>
            {(image) => (
              <Attachment orientation="vertical">
                <AttachmentMedia variant="image">
                  <img src={image.src} alt={image.alt} />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{image.name}</AttachmentTitle>
                  <AttachmentDescription>{image.meta}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction aria-label={`Remove ${image.name}`}>
                    <XIcon />
                  </AttachmentAction>
                </AttachmentActions>
                <AttachmentTrigger
                  render={(props) => (
                    <a
                      class={props.class}
                      href={image.src}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${image.name}`}
                    />
                  )}
                />
              </Attachment>
            )}
          </For>
        }
      </AttachmentGroup>
    </div>
  );
}

export default AttachmentImage;
