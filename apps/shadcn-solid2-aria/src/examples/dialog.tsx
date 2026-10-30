import { Button } from "../registry/ui/button";
import {
  DialogTrigger,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../registry/ui/dialog";
import { Input } from "../registry/ui/input";

export default function Example() {
  return (
    <DialogTrigger>
      <Button variant="outline">Edit profile</Button>
      <Dialog>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Save when you’re done.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <label for="profile-name" class="text-sm font-medium">
            Name
          </label>
          <Input id="profile-name" defaultValue="Alex Morgan" />
        </div>
        <DialogFooter>
          <DialogClose>Save changes</DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
