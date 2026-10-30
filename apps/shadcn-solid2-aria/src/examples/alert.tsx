import { Alert, AlertTitle, AlertDescription } from "../registry/ui/alert";

export default function Example() {
  return (
    <Alert class="max-w-sm">
      <AlertTitle>You’re all set.</AlertTitle>
      <AlertDescription>
        Your components are ready to use. Build something great.
      </AlertDescription>
    </Alert>
  );
}
