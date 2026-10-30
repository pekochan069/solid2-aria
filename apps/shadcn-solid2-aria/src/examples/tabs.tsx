import { Tabs, TabsList, TabsTrigger, TabsContent } from "../registry/ui/tabs";

export default function Example() {
  return (
    <Tabs defaultSelectedKey="account" class="w-full max-w-sm">
      <TabsList aria-label="Settings">
        <TabsTrigger id="account">Account</TabsTrigger>
        <TabsTrigger id="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent id="account">
        <div class="rounded-lg border p-5">
          <h3 class="mb-2 font-medium">Account</h3>
          <p class="text-muted-foreground text-sm">
            Manage your profile and account preferences.
          </p>
        </div>
      </TabsContent>
      <TabsContent id="security">
        <div class="rounded-lg border p-5">
          <h3 class="mb-2 font-medium">Security</h3>
          <p class="text-muted-foreground text-sm">
            Keep your account secure with a strong password.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
