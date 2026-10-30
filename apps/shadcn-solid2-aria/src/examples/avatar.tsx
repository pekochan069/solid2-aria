import { Avatar, AvatarFallback } from "../registry/ui/avatar";

export default function Example() {
  return (
    <div class="flex items-center gap-3">
      <Avatar size="lg">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JL</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>SK</AvatarFallback>
      </Avatar>
    </div>
  );
}
