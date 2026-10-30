import type { JSX } from "@solidjs/web";

/** Icon from Rune Icons by Rune Icons team - https://github.com/Runeicons/runeicons/blob/main/LICENSE */
export function SunIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      width="100%"
      height="100%"
      class={props.class}
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
            <path
              d="M12 2V4M12 20V22M4.93005 4.93018L6.34005 6.34018M17.66 17.6602L19.07 19.0702M2 12H4M20 12H22M6.34005 17.6602L4.93005 19.0702M19.07 4.93018L17.66 6.34018M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z"
              stroke="currentColor"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
