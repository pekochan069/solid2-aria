import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../registry/ui/resizable";

export default function Example() {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      class="h-40 w-full max-w-sm rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div class="flex h-full items-center justify-center p-6 text-sm">
          One
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div class="flex h-full items-center justify-center p-6 text-sm">
          Two
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
