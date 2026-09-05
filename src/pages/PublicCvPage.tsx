import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import type { Route } from "../hooks/useHashRoute";
import { Icon } from "../components/Icon";
import { CvPreview } from "../components/CvPreview";
import type { CvPreviewHandle } from "../components/CvPreview";
import { usePreviewScale } from "../hooks/usePreviewScale";
import { fetchPublicCv } from "../cloud/cvStore";
import { normalizeCvData } from "../data/normalize";
import { SupportToast } from "../components/SupportToast";
import "./PublicCvPage.css";

type LoadState = "loading" | "ready" | "not-found" | "error";

export function PublicCvPage({
  dictionary,
  publicId,
  navigate,
}: {
  dictionary: Dictionary;
  publicId: string;
  navigate: (route: Exclude<Route, "public-cv">) => void;
}) {
  const copy = dictionary.publicCv;
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<CvData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSupportToast, setShowSupportToast] = useState(false);
  const { containerRef, scale } = usePreviewScale();
  const previewRef = useRef<CvPreviewHandle>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCv(publicId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState("not-found");
          return;
        }
        setData(normalizeCvData(result.data));
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await previewRef.current?.exportPdf();
      setShowSupportToast(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="public-cv-page">
      <header className="public-cv-header">
        <button type="button" className="public-cv-brand" onClick={() => navigate("landing")}>
          <span className="public-cv-brand-mark">CV</span>
          {dictionary.nav.brand}
        </button>
        <span className="public-cv-badge">{copy.badge}</span>
      </header>

      {state === "loading" && <p className="public-cv-status">{copy.loading}</p>}
      {(state === "not-found" || state === "error") && <p className="public-cv-status">{copy.notFound}</p>}

      {state === "ready" && data && (
        <>
          <div className="public-cv-preview" ref={containerRef}>
            <div className="public-cv-preview-scaled" style={{ zoom: scale }}>
              <CvPreview data={data} dictionary={dictionary} ref={previewRef} />
            </div>
          </div>

          <div className="public-cv-cta">
            <button type="button" className="public-cv-download" onClick={() => void handleDownload()} disabled={isDownloading}>
              <Icon name="download" size={15} />
              {copy.download}
            </button>
            <button type="button" className="public-cv-make" onClick={() => navigate("landing")}>
              {copy.cta}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </>
      )}

      {showSupportToast && (
        <SupportToast dictionary={dictionary} onDismiss={() => setShowSupportToast(false)} />
      )}
    </div>
  );
}
