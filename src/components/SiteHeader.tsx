import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import { Icon } from "./Icon";
import "./SiteHeader.css";

export interface SiteNavItem {
  key: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  emphasis?: boolean;
}

/** Shared top navigation for the marketing and tool pages. The builder keeps
 *  its own denser toolbar. */
export function SiteHeader({
  dictionary,
  language,
  onLanguageChange,
  items,
  onBrandClick,
  authSlot,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  items: SiteNavItem[];
  onBrandClick: () => void;
  authSlot?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button type="button" className="site-brand" onClick={onBrandClick}>
          <span className="site-brand-mark">CV</span>
          {dictionary.nav.brand}
        </button>

        <nav className={`site-nav ${isOpen ? "open" : ""}`} aria-label={dictionary.siteNav.features}>
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`site-nav-link ${item.active ? "active" : ""} ${item.emphasis ? "emphasis" : ""}`}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="site-header-right">
          {authSlot}
          <div className="site-lang" role="group" aria-label="Language">
            <button type="button" className={language === "el" ? "active" : ""} onClick={() => onLanguageChange("el")}>
              GR
            </button>
            <button type="button" className={language === "en" ? "active" : ""} onClick={() => onLanguageChange("en")}>
              EN
            </button>
          </div>

          <button
            type="button"
            className="site-burger"
            aria-expanded={isOpen}
            aria-label={dictionary.siteNav.openMenu}
            onClick={() => setIsOpen((open) => !open)}
          >
            <Icon name={isOpen ? "x" : "menu"} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
