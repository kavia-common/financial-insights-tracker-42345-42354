import React from "react";

/**
 * Reusable surface card used across dashboard pages.
 */

// PUBLIC_INTERFACE
export function Card({ title, subtitle, actions, children }) {
  /** Displays a styled card with optional header and body content. */
  return (
    <section className="card" aria-label={title ? `${title} card` : "card"}>
      {(title || subtitle || actions) ? (
        <header className="cardHeaderRow">
          <div>
            {title ? <h2 className="cardTitle">{title}</h2> : null}
            {subtitle ? <p className="cardSubtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      <div className="cardBody">{children}</div>
    </section>
  );
}
