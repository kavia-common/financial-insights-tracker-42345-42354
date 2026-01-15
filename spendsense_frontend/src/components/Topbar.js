import React from "react";
import { IconChevronDown, IconSearch } from "./Icons";

// PUBLIC_INTERFACE
export function Topbar({ title, subtitle, searchValue, onSearchChange, rightContent }) {
  /** Top navigation bar containing page title, search, and user avatar. */
  return (
    <div className="topbar" role="banner" aria-label="Top navigation">
      <div className="pageTitle">
        <h1 className="h1">{title}</h1>
        {subtitle ? <p className="h1Sub">{subtitle}</p> : null}
      </div>

      <div className="topbarRight">
        <div className="searchWrap">
          <IconSearch className="searchIcon" title="Search" />
          <input
            className="searchInput"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search transactions, merchants, categories…"
            aria-label="Search"
          />
        </div>

        {rightContent ? rightContent : (
          <button type="button" className="avatarBtn" aria-label="User menu">
            <span className="avatarCircle" aria-hidden="true">JS</span>
            <span className="avatarMeta">
              <span className="avatarName">Jordan</span>
              <span className="avatarRole">Personal</span>
            </span>
            <IconChevronDown width="18" height="18" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
