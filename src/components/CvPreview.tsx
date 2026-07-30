import { useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { getSidebarPalette } from "../utils/contrast";
import { buildPdfFilename, exportPagesToPdf } from "../utils/exportPdf";
import { FONT_STACKS } from "../data/fontStacks";
import { CvPage } from "../pagination/CvPage";
import { MeasurePanel } from "../pagination/MeasurePanel";
import { useMainPagination } from "../pagination/useMainPagination";
import { Icon } from "./Icon";
import "./CvPreview.css";

export interface CvPreviewHandle {
  exportPdf: () => Promise<void>;
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export function CvPreview({
  data,
  dictionary,
  ref,
}: {
  data: CvData;
  dictionary: Dictionary;
  ref?: Ref<CvPreviewHandle>;
}) {
  const { pages, metas, itemRefs, headingSampleRef, metrics } = useMainPagination(data, dictionary);
  const [pageIndex, setPageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const printPageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentPage = Math.min(pageIndex, Math.max(0, pages.length - 1));

  useImperativeHandle(
    ref,
    () => ({
      exportPdf: async () => {
        setIsExporting(true);
        await waitForPaint();
        try {
          const elements = printPageRefs.current.filter((el): el is HTMLDivElement => el !== null);
          await exportPagesToPdf(elements, buildPdfFilename(data.personalInfo.fullName));
        } finally {
          setIsExporting(false);
        }
      },
    }),
    [data],
  );

  const palette = getSidebarPalette(data.themeColor);
  const themeStyle = {
    "--cv-accent": data.themeColor,
    "--cv-sidebar-text": palette.text,
    "--cv-sidebar-text-soft": palette.textSoft,
    "--cv-sidebar-border": palette.border,
    "--cv-sidebar-track": palette.track,
    "--cv-scale": metrics.scale,
    fontFamily: FONT_STACKS[data.fontFamily],
  } as CSSProperties;

  return (
    <div className="cv-preview-wrap">
      {pages.length > 1 && (
        <nav className="cv-pagination" aria-label={dictionary.pagination.page}>
          <button
            type="button"
            disabled={currentPage === 0}
            title={dictionary.pagination.previousPage}
            onClick={() => setPageIndex(currentPage - 1)}
          >
            <Icon name="arrow-left" size={16} />
          </button>
          <strong>
            {dictionary.pagination.page} {currentPage + 1} / {pages.length}
          </strong>
          <button
            type="button"
            disabled={currentPage === pages.length - 1}
            title={dictionary.pagination.nextPage}
            onClick={() => setPageIndex(currentPage + 1)}
          >
            <Icon name="arrow-right" size={16} />
          </button>
        </nav>
      )}

      <CvPage
        page={pages[currentPage] ?? []}
        pageIndex={currentPage}
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
          width={metrics.mainWidth}
          themeStyle={themeStyle}
        />,
        document.body,
      )}

      {createPortal(
        <div
          className="cv-print-stack"
          aria-hidden="true"
          style={isExporting ? { display: "block", position: "fixed", top: 0, left: -10000, zIndex: -1 } : undefined}
        >
          {pages.map((page, index) => (
            <CvPage
              key={index}
              page={page}
              pageIndex={index}
              data={data}
              dictionary={dictionary}
              themeStyle={themeStyle}
              className="cv-print-page"
              pageRef={(el) => {
                printPageRefs.current[index] = el;
              }}
            />
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
