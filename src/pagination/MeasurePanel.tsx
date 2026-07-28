import type { RefObject } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { BlockContent, SectionHeading } from "./mainBlocks";
import type { MainBlockMeta } from "./mainBlocks";
import { MAIN_CONTENT_WIDTH } from "./useMainPagination";

export function MeasurePanel({
  metas,
  data,
  dictionary,
  itemRefs,
  headingSampleRef,
}: {
  metas: MainBlockMeta[];
  data: CvData;
  dictionary: Dictionary;
  itemRefs: RefObject<(HTMLDivElement | null)[]>;
  headingSampleRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="cv-measure-panel"
      style={{
        position: "fixed",
        top: 0,
        left: -9999,
        width: MAIN_CONTENT_WIDTH,
        visibility: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div ref={headingSampleRef} className="cv-main-section">
        <SectionHeading section="experience" dictionary={dictionary} continuation />
        <div />
      </div>

      {metas.map((meta, index) => (
        <div
          key={meta.key}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className={meta.isSectionStart ? "cv-main-section" : undefined}
        >
          {meta.isSectionStart && <SectionHeading section={meta.section} dictionary={dictionary} />}
          <BlockContent meta={meta} data={data} dictionary={dictionary} />
        </div>
      ))}
    </div>
  );
}
