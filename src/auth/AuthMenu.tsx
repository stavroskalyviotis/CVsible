import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import { Icon } from "../components/Icon";
import { isCloudConfigured } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import "./AuthMenu.css";

/** Compact sign-in button / account dropdown, shared by the marketing pages'
 *  header and the builder topbar. Renders nothing until Supabase is configured. */
export function AuthMenu({
  dictionary,
  onOpenMyCvs,
}: {
  dictionary: Dictionary;
  onOpenMyCvs?: () => void;
}) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  if (!isCloudConfigured || loading) return null;

  if (!user) {
    return (
      <button
        type="button"
        className="auth-signin-button"
        disabled={isSigningIn}
        aria-label={isSigningIn ? dictionary.auth.signingIn : dictionary.auth.signIn}
        onClick={() => {
          setIsSigningIn(true);
          void signInWithGoogle();
        }}
      >
        <span className="auth-google-mark" aria-hidden="true">
          G
        </span>
        <span className="auth-signin-label">
          {isSigningIn ? dictionary.auth.signingIn : dictionary.auth.signIn}
        </span>
      </button>
    );
  }

  const avatarUrl = (user.user_metadata as Record<string, unknown> | undefined)?.avatar_url as
    | string
    | undefined;
  const displayName =
    ((user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined) ??
    user.email ??
    "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="auth-menu" ref={menuRef}>
      <button
        type="button"
        className="auth-avatar-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="auth-avatar-fallback">{initial || <Icon name="user" size={14} />}</span>
        )}
      </button>

      {isOpen && (
        <div className="auth-menu-pop" role="menu">
          {displayName && <div className="auth-menu-identity">{displayName}</div>}
          {onOpenMyCvs && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onOpenMyCvs();
              }}
            >
              <Icon name="folder" size={15} />
              {dictionary.siteNav.myCvs}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
          >
            <Icon name="log-out" size={15} />
            {dictionary.auth.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
