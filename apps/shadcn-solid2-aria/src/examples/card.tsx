import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../registry/ui/card";

export default function Example() {
  return (
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>A little more possibility.</CardTitle>
        <CardDescription>
          Start with a component. Make something yours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground text-sm">
          Composable, accessible components for your next Solid 2 project.
        </p>
      </CardContent>
      <CardFooter>
        <span class="text-muted-foreground text-xs">
          Solid 2 · Tailwind CSS · Solid2 Aria
        </span>
      </CardFooter>
    </Card>
  );
}
