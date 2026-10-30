import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "../registry/ui/empty";

export default function Example() {
  return (
    <Empty class="w-full max-w-sm">
      <EmptyHeader>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Your next idea starts here. Create a project to get going.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
