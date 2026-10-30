import luma from "../styles/themes/luma.css?url";
import lyra from "../styles/themes/lyra.css?url";
import maia from "../styles/themes/maia.css?url";
import mira from "../styles/themes/mira.css?url";
import nova from "../styles/themes/nova.css?url";
import rhea from "../styles/themes/rhea.css?url";
import sera from "../styles/themes/sera.css?url";
import vega from "../styles/themes/vega.css?url";

const themeStylesheets = new Map([
  ["luma", luma],
  ["lyra", lyra],
  ["maia", maia],
  ["mira", mira],
  ["nova", nova],
  ["rhea", rhea],
  ["sera", sera],
  ["vega", vega],
]);

export function getThemeStylesheet(name: string): string {
  return themeStylesheets.get(name) ?? nova;
}
