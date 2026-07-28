import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { getSidebarPalette } from "../utils/contrast";
import { CvPage } from "../pagination/CvPage";
import { MeasurePanel } from "../pagination/MeasurePanel";
import { useMainPagination } from "../pagination/useMainPagination";
import { Icon } from "./Icon";
import "./CvPreview.css";

export function CvPreview({ data, dictionary }: { data: CvData; dictionary: Dictionary }) {
  const { pages, metas, itemRefs, headingSampleRef } = useMainPagination(data, dictionary);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex((current) => Math.min(current, pages.length - 1));
  }, [pages.length]);

  const palette = getSidebarPalette(data.themeColor);
  const themeStyle = {
    "--cv-accent": data.themeColor,
    "--cv-sidebar-text": palette.text,
    "--cv-sidebar-text-soft": palette.textSoft,
    "--cv-sidebar-border": palette.border,
    "--cv-sidebar-track": palette.track,
  } as CSSProperties;

  return (
    <div className="cv-preview-wrap">
      {pages.length > 1 && (
        <nav className="cv-pagination" aria-label={dictionary.pagination.page}>
          <button
            type="button"
            disabled={pageIndex === 0}
            title={dictionary.pagination.previousPage}
            onClick={() => setPageIndex((index) => index - 1)}
          >
            <Icon name="arrow-left" size={16} />
          </button>
          <strong>
            {dictionary.pagination.page} {pageIndex + 1} / {pages.length}
          </strong>
          <button
            type="button"
            disabled={pageIndex === pages.length - 1}
            title={dictionary.pagination.nextPage}
            onClick={() => setPageIndex((index) => index + 1)}
          >
            <Icon name="arrow-right" size={16} />
          </button>
        </nav>
      )}

      <CvPage
        page={pages[pageIndex] ?? []}
        pageIndex={pageIndex}
        data={data}
        dictionary={dictionary}
        themeStyle={themeStyle}
        className="cv-screen-page"
      />

      {createPortal(
        <MeasurePanel
          metas={metas}
          data={data}
          dictionary={dictionary}
          itemRefs={itemRefs}
          headingSampleRef={headingSampleRef}
        />,
        document.body,
      )}

      {createPortal(
        <div className="cv-print-stack" aria-hidden="true">
          {pages.map((page, index) => (
            <CvPage
              key={index}
              page={page}
              pageIndex={index}
              data={data}
              dictionary={dictionary}
              themeStyle={themeStyle}
              className="cv-print-page"
            />
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
