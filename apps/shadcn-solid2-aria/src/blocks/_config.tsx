import type { JSX } from "@solidjs/web";

export const FONTS = [
  { name: "Geist", value: "geist" },
  { name: "Geist Mono", value: "geist-mono" },
  { name: "System", value: "system" },
];

export const STYLES = [
  "nova",
  "vega",
  "maia",
  "lyra",
  "mira",
  "luma",
  "sera",
  "rhea",
].map((name) => ({
  name,
  title: name.charAt(0).toUpperCase() + name.slice(1),
}));

export function useDesignSystemSearchParams(): [
  { font: string; fontHeading: string; style: string; iconLibrary: string },
] {
  return [
    {
      font: "geist",
      fontHeading: "geist",
      iconLibrary: "lucide",
      style: "nova",
    },
  ];
}

export function Fragment(props: { children?: JSX.Element }) {
  return <>{props.children}</>;
}

export function QRCode(props: { value: string; size: number; level?: string }) {
  return (
    <img
      src={`/images/blocks/connect-qr.svg`}
      width={props.size}
      height={props.size}
      alt={`QR code: ${props.value}`}
    />
  );
}
