import { useCallback, useEffect, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { LanguageCode } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import { SiteHeader } from "../components/SiteHeader";
import { buildSiteNav } from "../components/siteNav";
import { AuthMenu } from "../auth/AuthMenu";
import { useAuth } from "../auth/useAuth";
import { supabase, isCloudConfigured } from "../lib/supabaseClient";
import {
  MAX_CVS_PER_USER,
  deleteCv,
  duplicateCv,
  listCvs,
  renameCv,
  setCvPublic,
  updateCvHistory,
} from "../cloud/cvStore";
import type { ApplicationEntry, CloudCv } from "../cloud/cvStore";
import { CvHistoryPanel } from "../cloud/CvHistoryPanel";
import { createEmptyCvData } from "../data/defaultData";
import { normalizeCvData } from "../data/normalize";
import { saveCvData, setCurrentCloudId } from "../utils/storage";
import "./MyCvsPage.css";

export function MyCvsPage({
  dictionary,
  language,
  onLanguageChange,
  navigate,
}: {
  dictionary: Dictionary;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  navigate: (route: Exclude<Route, "public-cv">) => void;
}) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const copy = dictionary.myCvsPage;
  const [cvs, setCvs] = useState<CloudCv[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!user) return;
    listCvs()
      .then(setCvs)
      .catch(() => setError(copy.loadError));
  }, [user, copy.loadError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dateFormatter = new Intl.DateTimeFormat(language === "el" ? "el-GR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const openCv = (cv: CloudCv) => {
    saveCvData(normalizeCvData(cv.data));
    setCurrentCloudId(cv.id);
    navigate("builder");
  };

  const createNew = () => {
    if ((cvs?.length ?? 0) >= MAX_CVS_PER_USER) return;
    saveCvData(createEmptyCvData());
    setCurrentCloudId(null);
    navigate("builder");
  };

  const runAction = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      refresh();
    } catch {
      setError(copy.actionError);
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = (cv: CloudCv) => {
    if (!user) return;
    if ((cvs?.length ?? 0) >= MAX_CVS_PER_USER) return;
    void runAction(cv.id, async () => {
      await duplicateCv(user.id, cv, `${cv.name} · ${copy.duplicate}`);
    });
  };

  const handleRename = (cv: CloudCv) => {
    const next = window.prompt(copy.renamePrompt, cv.name);
    if (!next || !next.trim()) return;
    void runAction(cv.id, () => renameCv(cv.id, next.trim()));
  };

  const handleDelete = (cv: CloudCv) => {
    if (!window.confirm(copy.deleteConfirm)) return;
    void runAction(cv.id, () => deleteCv(cv.id));
  };

  const handleToggleShare = (cv: CloudCv) => {
    void runAction(cv.id, async () => {
      await setCvPublic(cv.id, !cv.isPublic);
    });
  };

  const handleCopyLink = async (cv: CloudCv) => {
    if (!cv.publicId) return;
    const url = `${window.location.origin}${window.location.pathname}#/cv/${cv.publicId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(cv.id);
      window.setTimeout(() => setCopiedId((current) => (current === cv.id ? null : current)), 1800);
    } catch {
      window.prompt(copy.copyLink, url);
    }
  };

  const handleHistoryChange = (cv: CloudCv, next: ApplicationEntry[]) => {
    setCvs((prev) => prev?.map((item) => (item.id === cv.id ? { ...item, history: next } : item)) ?? prev);
    void updateCvHistory(cv.id, next).catch(() => setError(copy.actionError));
  };

  const atLimit = (cvs?.length ?? 0) >= MAX_CVS_PER_USER;

  const handleDeleteAccount = async () => {
    if (!window.confirm(dictionary.auth.deleteAccountConfirm) || !supabase) return;
    setIsDeletingAccount(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("delete_failed");
      window.alert(dictionary.auth.deleteAccountDone);
      await signOut();
      navigate("landing");
    } catch {
      window.alert(dictionary.auth.deleteAccountError);
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="mycvs-page">
      <SiteHeader
        dictionary={dictionary}
        language={language}
        onLanguageChange={onLanguageChange}
        items={buildSiteNav(dictionary, "landing", navigate)}
        onBrandClick={() => navigate("landing")}
        authSlot={<AuthMenu dictionary={dictionary} onOpenMyCvs={() => navigate("my-cvs")} />}
      />

      <main className="mycvs-main">
        <div className="mycvs-head">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        {!isCloudConfigured && <p className="mycvs-error">{copy.loadError}</p>}

        {isCloudConfigured && !authLoading && !user && (
          <div className="mycvs-signin">
            <p>{copy.signInPrompt}</p>
            <AuthMenu dictionary={dictionary} />
          </div>
        )}

        {isCloudConfigured && user && (
          <>
            <div className="mycvs-toolbar">
              <button type="button" className="mycvs-new" onClick={createNew} disabled={atLimit}>
                <Icon name="plus" size={15} />
                {copy.newCta}
              </button>
              {atLimit && <span className="mycvs-limit">{copy.limitReached}</span>}
            </div>

            {error && <p className="mycvs-error">{error}</p>}

            {cvs === null && <p className="mycvs-status">{copy.loading}</p>}
            {cvs !== null && cvs.length === 0 && <p className="mycvs-status">{copy.empty}</p>}

            <ul className="mycvs-list">
              {cvs?.map((cv) => (
                <li key={cv.id} className={busyId === cv.id ? "busy" : ""}>
                  <div className="mycvs-row-main">
                    <strong>{cv.name || copy.untitled}</strong>
                    <span className="mycvs-updated">
                      {copy.updated}: {dateFormatter.format(new Date(cv.updatedAt))}
                    </span>
                  </div>

                  <div className="mycvs-row-actions">
                    <button type="button" onClick={() => openCv(cv)}>
                      <Icon name="arrow-right" size={14} />
                      {copy.open}
                    </button>
                    <button type="button" onClick={() => handleDuplicate(cv)} disabled={atLimit}>
                      <Icon name="copy" size={14} />
                      {copy.duplicate}
                    </button>
                    <button type="button" onClick={() => handleRename(cv)}>
                      {copy.rename}
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(cv)}>
                      <Icon name="trash" size={14} />
                      {copy.delete}
                    </button>
                  </div>

                  <div className="mycvs-share">
                    <label className="mycvs-share-toggle">
                      <input
                        type="checkbox"
                        checked={cv.isPublic}
                        onChange={() => handleToggleShare(cv)}
                      />
                      <Icon name="link" size={13} />
                      {cv.isPublic ? copy.shareOn : copy.shareOff}
                    </label>
                    {cv.isPublic && cv.publicId && (
                      <button type="button" className="mycvs-copy-link" onClick={() => void handleCopyLink(cv)}>
                        {copiedId === cv.id ? copy.linkCopied : copy.copyLink}
                      </button>
                    )}
                    <button
                      type="button"
                      className="mycvs-history-toggle"
                      onClick={() => setExpandedId((current) => (current === cv.id ? null : cv.id))}
                    >
                      <Icon name={expandedId === cv.id ? "chevron-up" : "chevron-down"} size={13} />
                      {dictionary.cvHistory.toggle}
                      {cv.history.length > 0 && ` (${cv.history.length})`}
                    </button>
                  </div>

                  {expandedId === cv.id && (
                    <CvHistoryPanel
                      entries={cv.history}
                      dictionary={dictionary}
                      onChange={(next) => handleHistoryChange(cv, next)}
                    />
                  )}
                </li>
              ))}
            </ul>

            <div className="mycvs-danger-zone">
              <button type="button" onClick={() => void handleDeleteAccount()} disabled={isDeletingAccount}>
                <Icon name="trash" size={14} />
                {dictionary.auth.deleteAccount}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
