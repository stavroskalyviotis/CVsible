import type { CSSProperties, RefObject } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { BlockContent, SectionHeading } from "./mainBlocks";
import type { MainBlockMeta } from "./blockMeta";

export function MeasurePanel({
  metas,
  data,
  dictionary,
  itemRefs,
  headingSampleRef,
  width,
  themeStyle,
}: {
  metas: MainBlockMeta[];
  data: CvData;
  dictionary: Dictionary;
  itemRefs: RefObject<(HTMLDivElement | null)[]>;
  headingSampleRef: RefObject<HTMLDivElement | null>;
  width: number;
  themeStyle: CSSProperties;
}) {
  return (
    <div
      className="cv-measure-panel"
      style={{
        ...themeStyle,
        position: "fixed",
        top: 0,
        left: -9999,
        width,
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
