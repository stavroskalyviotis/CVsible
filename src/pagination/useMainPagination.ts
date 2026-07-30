import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { getDensityMetrics } from "../data/density";
import { buildMainBlockMetas } from "./blockMeta";
import type { MainBlockMeta } from "./blockMeta";

const OVERFLOW_TOLERANCE = 24;

export interface PageBlock {
  meta: MainBlockMeta;
  needsContinuationHeading: boolean;
}

function paginateBlocks(
  metas: MainBlockMeta[],
  heights: number[],
  continuationHeadingHeight: number,
  capacity: number,
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

    if (!isFirstOnPage && used + cost > capacity + OVERFLOW_TOLERANCE) {
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

export function useMainPagination(data: CvData, dictionary: Dictionary) {
  const metrics = getDensityMetrics(data.density);
  const metas = useMemo(() => buildMainBlockMetas(data), [data]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingSampleRef = useRef<HTMLDivElement | null>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const [continuationHeadingHeight, setContinuationHeadingHeight] = useState(0);

  useLayoutEffect(() => {
    const measured = metas.map((_, index) => itemRefs.current[index]?.offsetHeight ?? 0);
    setHeights(measured);
    setContinuationHeadingHeight(headingSampleRef.current?.offsetHeight ?? 0);
  }, [metas, dictionary, metrics.mainWidth, metrics.scale]);

  const pages = useMemo<PageBlock[][]>(() => {
    if (heights.length !== metas.length) return [[]];
    return paginateBlocks(
      metas,
      heights,
      continuationHeadingHeight,
      metrics.mainCapacity,
      metrics.sectionGap,
      metrics.entryGap,
    );
  }, [metas, heights, continuationHeadingHeight, metrics.mainCapacity, metrics.sectionGap, metrics.entryGap]);

  return {
    pages,
    metas,
    itemRefs,
    headingSampleRef,
    metrics,
    isMeasuring: heights.length !== metas.length,
  };
}
