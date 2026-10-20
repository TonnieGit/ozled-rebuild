/** Inline SVG icon set (24px grid, 1.75 stroke). No icon library: keeps JS and CSS budgets. */
const PATHS = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35",
  cart: "M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6.2M9 21h.01M18 21h.01",
  user: "M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
  chevronDown: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  check: "m5 12 5 5 9-10",
  truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  store: "M4 10v10h16V10M3 4h18l-1 6H4L3 4Zm6 16v-6h6v6",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  droplet: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z",
  shield: "M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2",
  download: "M12 4v11m0 0-4-4m4 4 4-4M5 20h14",
  play: "M8 5v14l11-7L8 5Z",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  filter: "M4 5h16M7 12h10M10 19h4",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5v-4m0-4h.01",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 1 1 8 0v4",
  ruler: "M3 17 17 3l4 4L7 21l-4-4Zm4-4 2 2m2-6 2 2m2-6 2 2",
  plug: "M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7Zm6 10v5",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  wrench: "M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L3 11l8-8 3.7 3.3Z",
  arrowRight: "M5 12h14m-6-6 6 6-6 6",
  external: "M14 4h6v6m0-6L10 14M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  className,
  label,
}: {
  name: IconName;
  size?: number;
  className?: string;
  /** Provide for meaningful icons; omit for decorative ones next to text. */
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={name === "star" || name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
