import type { JSX } from "@solidjs/web";

/** Icon from Rune Icons by Rune Icons team - https://github.com/Runeicons/runeicons/blob/main/LICENSE */
export function XIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      width="100%"
      height="100%"
      {...props}
    >
      <rect
        x="0"
        y="0"
        width="24"
        height="24"
        rx="2.250"
        ry="2.250"
        fill="transparent"
      />
      <g transform="translate(0.75, 0.75) scale(0.9375)">
        <g
          transform="translate(12, 12) rotate(0) scale(1, 1) translate(-12, -12)"
          stroke="currentColor"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g class="icon-anim-container icon-anim-group">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" />
          </g>
        </g>
      </g>
    </svg>
  );
}
