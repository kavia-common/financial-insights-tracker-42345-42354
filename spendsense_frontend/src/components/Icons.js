import React from "react";

/**
 * Simple inline SVG icons to avoid adding an icon dependency.
 * All icons accept `title` for accessibility (screen readers).
 */

function IconBase({ children, title, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

// PUBLIC_INTERFACE
export function IconLayout(props) {
  /** Dashboard icon */
  return (
    <IconBase {...props}>
      <path
        d="M4 4h7v9H4V4Zm9 0h7v5h-7V4ZM4 15h7v5H4v-5Zm9-4h7v9h-7v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconWallet(props) {
  /** Transactions icon */
  return (
    <IconBase {...props}>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 12h4v3h-4a1.5 1.5 0 0 1 0-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="16.8" cy="13.5" r="0.8" fill="currentColor" />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconSparkles(props) {
  /** Insights icon */
  return (
    <IconBase {...props}>
      <path
        d="M12 2l1.2 4.1L17 7.3l-3.8 1.2L12 12l-1.2-3.5L7 7.3l3.8-1.2L12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5 13l.8 2.7L8.5 17l-2.7.8L5 20l-.8-2.2L1.5 17l2.7-1.3L5 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 13l.7 2.1L22 16l-2.3.9L19 19l-.7-2.1L16 16l2.3-.9L19 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconBell(props) {
  /** Alerts icon */
  return (
    <IconBase {...props}>
      <path
        d="M12 22a2.5 2.5 0 0 0 2.3-1.6H9.7A2.5 2.5 0 0 0 12 22Z"
        fill="currentColor"
      />
      <path
        d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2h15L18 16Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconSettings(props) {
  /** Settings icon */
  return (
    <IconBase {...props}>
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15.2l1.1-1.9-1.8-3.1-2.2.2a7.3 7.3 0 0 0-1.6-1l-.4-2.1H9.5l-.4 2.1a7.3 7.3 0 0 0-1.6 1l-2.2-.2-1.8 3.1 1.1 1.9a7.3 7.3 0 0 0 0 2l-1.1 1.9 1.8 3.1 2.2-.2c.5.4 1 .7 1.6 1l.4 2.1h4.9l.4-2.1c.6-.3 1.1-.6 1.6-1l2.2.2 1.8-3.1-1.1-1.9c.1-.7.1-1.3 0-2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconSearch(props) {
  /** Search icon */
  return (
    <IconBase {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconChevronDown(props) {
  /** Chevron down icon */
  return (
    <IconBase {...props}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconArrowUpRight(props) {
  /** Arrow up-right icon */
  return (
    <IconBase {...props}>
      <path
        d="M7 17 17 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 7h7v7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

// PUBLIC_INTERFACE
export function IconArrowDownRight(props) {
  /** Arrow down-right icon */
  return (
    <IconBase {...props}>
      <path
        d="M7 7l10 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 10v7h-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
