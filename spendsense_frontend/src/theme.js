// PUBLIC_INTERFACE
export const theme = {
  /** Ocean Professional (Modern Fintech) theme tokens (mirrors CSS variables). */
  colors: {
    primary: "#2563EB",
    accent: "#F59E0B",
    success: "#10B981",
    danger: "#EF4444",

    /* Neutral / surfaces */
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#111827",
    muted: "#6B7280",
    border: "rgba(17,24,39,0.10)",

    /* Helpful derived colors (for subtle UI states) */
    primaryTint: "rgba(37,99,235,0.10)",
    accentTint: "rgba(245,158,11,0.12)",
    overlay: "rgba(17,24,39,0.45)",
  },

  gradients: {
    /** Primary ocean gradient for accents and CTA surfaces. */
    primary: "linear-gradient(135deg, #2563EB 0%, #38BDF8 55%, #A5F3FC 100%)",
    /** More restrained gradient (e.g., thin borders, bars). */
    primarySoft: "linear-gradient(135deg, rgba(37,99,235,0.95) 0%, rgba(56,189,248,0.85) 60%, rgba(165,243,252,0.65) 100%)",
    /** App background gradient (soft, mostly neutral). */
    appBackground:
      "radial-gradient(1200px 600px at 18% 0%, rgba(37, 99, 235, 0.12), transparent 55%), radial-gradient(1000px 500px at 90% 8%, rgba(245, 158, 11, 0.10), transparent 55%), linear-gradient(180deg, rgba(37, 99, 235, 0.06), #f9fafb 55%)",
    /** Subtle sheen used on hover overlays (keeps readability). */
    sheen: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(37,99,235,0.09) 50%, rgba(255,255,255,0) 100%)",
  },

  surface: {
    /** Slightly translucent surface used for glassy headers/bars. */
    glass: "rgba(255,255,255,0.84)",
    /** Stronger glass surface (e.g., navbar panel). */
    glassStrong: "rgba(255,255,255,0.94)",
    /** Card surface should remain readable (mostly solid). */
    card: "rgba(255,255,255,0.92)",
  },

  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    pill: 999,
  },

  shadow: {
    xs: "0 1px 1px rgba(17,24,39,0.04)",
    sm: "0 1px 2px rgba(17,24,39,0.06)",
    md: "0 10px 22px rgba(17,24,39,0.10)",
    lg: "0 18px 50px rgba(17,24,39,0.14)",

    /* "Depth" shadows for floating UI (dropdowns/overlays) */
    depth1: "0 10px 24px rgba(17,24,39,0.10), 0 1px 0 rgba(255,255,255,0.55) inset",
    depth2: "0 22px 60px rgba(17,24,39,0.16), 0 1px 0 rgba(255,255,255,0.60) inset",
  },

  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
  },

  motion: {
    ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    dur1: 120,
    dur2: 220,
    dur3: 360,
  },

  focus: {
    /** Ocean ring + slight amber edge for clearer focus on pale backgrounds. */
    ring: "0 0 0 4px rgba(37, 99, 235, 0.14)",
    ringStrong: "0 0 0 4px rgba(37, 99, 235, 0.18), 0 0 0 1px rgba(245, 158, 11, 0.18)",
  },
};
