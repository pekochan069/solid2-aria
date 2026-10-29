import { Drawer } from "@solid2-aria/vaul";

export function App() {
  return Drawer.Root({
    get children() {
      return [
        Drawer.Trigger({ children: "Open drawer" }),
        Drawer.Portal({
          get children() {
            return [
              Drawer.Overlay({}),
              Drawer.Content({
                get children() {
                  return [
                    Drawer.Title({ children: "Package title" }),
                    Drawer.Description({ children: "Package description" }),
                    Drawer.Close({ children: "Done" }),
                  ];
                },
              }),
            ];
          },
        }),
      ];
    },
  });
}
