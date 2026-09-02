import type { CSSProperties, RefObject } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { getTemplate } from "../templates/registry";
import { BlockContent, SectionHeading } from "./blocks";
import { CvHeader } from "./CvPage";
import type { BlockMeta } from "./blockMeta";

/** Off-screen copy of every block, laid out at the real content width so the
 *  paginator can read true heights before deciding where pages break. */
export function MeasurePanel({
  metas,
  data,
  dictionary,
  itemRefs,
  headingSampleRef,
  headerSampleRef,
  width,
  themeStyle,
}: {
  metas: BlockMeta[];
  data: CvData;
  dictionary: Dictionary;
  itemRefs: RefObject<(HTMLDivElement | null)[]>;
  headingSampleRef: RefObject<HTMLDivElement | null>;
  headerSampleRef: RefObject<HTMLDivElement | null>;
  width: number;
  themeStyle: CSSProperties;
}) {
  const template = getTemplate(data.template);
  const showIcons = template.layout === "sidebar";

  return (
    <div
      className={`cv-measure-panel cv-page cv-tpl-${template.id}`}
      style={{
        ...themeStyle,
        position: "fixed",
        top: 0,
        left: -9999,
        width,
        minHeight: 0,
        display: "block",
        boxShadow: "none",
        visibility: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div ref={headingSampleRef} className="cv-main-section">
        <SectionHeading section="experience" dictionary={dictionary} showIcon={showIcons} atsSafe={template.atsSafe} continuation />
        <div />
      </div>

      {template.layout === "single" && (
        <CvHeader data={data} dictionary={dictionary} headerRef={headerSampleRef} />
      )}

      {metas.map((meta, index) => (
        <div
          key={meta.key}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className={meta.isSectionStart ? "cv-main-section" : undefined}
        >
          {meta.isSectionStart && (
            <SectionHeading section={meta.section} dictionary={dictionary} showIcon={showIcons} atsSafe={template.atsSafe} />
          )}
          <BlockContent meta={meta} data={data} dictionary={dictionary} showIcon={showIcons} />
        </div>
      ))}
    </div>
  );
}
