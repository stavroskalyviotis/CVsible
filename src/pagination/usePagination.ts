import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { getTemplate, getTemplateMetrics } from "../templates/registry";
import { buildBlockMetas } from "./blockMeta";
import type { BlockMeta } from "./blockMeta";

const OVERFLOW_TOLERANCE = 24;

export interface PageBlock {
  meta: BlockMeta;
  needsContinuationHeading: boolean;
}

function paginateBlocks(
  metas: BlockMeta[],
  heights: number[],
  continuationHeadingHeight: number,
  capacityFor: (pageIndex: number) => number,
  sectionGap: number,
  entryGap: number,
): PageBlock[][] {
  if (metas.length === 0) return [[]];

  const pages: PageBlock[][] = [];
  let current: PageBlock[] = [];
  let used = 0;

  metas.forEach((meta, index) => {
    const height = heights[index] ?? 0;
    const isFirstOnPage = current.length === 0;
    let needsContinuationHeading = isFirstOnPage && !meta.isSectionStart;
    let cost = height;

    if (isFirstOnPage) {
      if (needsContinuationHeading) cost += continuationHeadingHeight;
    } else {
      cost += meta.isSectionStart ? sectionGap : entryGap;
    }

    if (!isFirstOnPage && used + cost > capacityFor(pages.length) + OVERFLOW_TOLERANCE) {
      pages.push(current);
      current = [];
      used = 0;
      needsContinuationHeading = !meta.isSectionStart;
      cost = height + (needsContinuationHeading ? continuationHeadingHeight : 0);
    }

    current.push({ meta, needsContinuationHeading });
    used += cost;
  });

  if (current.length > 0) pages.push(current);
  return pages;
}

export function usePagination(data: CvData, dictionary: Dictionary) {
  const template = getTemplate(data.template);
  const metrics = getTemplateMetrics(data.template, data.density);
  const metas = useMemo(() => buildBlockMetas(data, data.template), [data]);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingSampleRef = useRef<HTMLDivElement | null>(null);
  const headerSampleRef = useRef<HTMLDivElement | null>(null);

  const [heights, setHeights] = useState<number[]>([]);
  const [continuationHeadingHeight, setContinuationHeadingHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    setHeights(metas.map((_, index) => itemRefs.current[index]?.offsetHeight ?? 0));
    setContinuationHeadingHeight(headingSampleRef.current?.offsetHeight ?? 0);
    setHeaderHeight(headerSampleRef.current?.offsetHeight ?? 0);
  }, [metas, dictionary, metrics.contentWidth, metrics.scale, data.template]);

  const pages = useMemo<PageBlock[][]>(() => {
    if (heights.length !== metas.length) return [[]];
    const firstPageCapacity =
      template.layout === "single" ? metrics.capacity - headerHeight - metrics.sectionGap : metrics.capacity;

    return paginateBlocks(
      metas,
      heights,
      continuationHeadingHeight,
      (pageIndex) => (pageIndex === 0 ? firstPageCapacity : metrics.capacity),
      metrics.sectionGap,
      metrics.entryGap,
    );
  }, [
    metas,
    heights,
    continuationHeadingHeight,
    headerHeight,
    template.layout,
    metrics.capacity,
    metrics.sectionGap,
    metrics.entryGap,
  ]);

  return {
    pages,
    metas,
    itemRefs,
    headingSampleRef,
    headerSampleRef,
    metrics,
    template,
    isMeasuring: heights.length !== metas.length,
  };
}
