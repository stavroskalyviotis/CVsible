import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "../i18n/translations";
import type { CvData } from "../types";
import { buildMainBlockMetas } from "./blockMeta";
import type { MainBlockMeta } from "./blockMeta";

export const MAIN_CONTENT_WIDTH = 476;
export const MAIN_CONTENT_CAPACITY = 1059;
export const SECTION_GAP = 16;
export const ENTRY_GAP = 10;
const OVERFLOW_TOLERANCE = 24;

export interface PageBlock {
  meta: MainBlockMeta;
  needsContinuationHeading: boolean;
}

function paginateBlocks(
  metas: MainBlockMeta[],
  heights: number[],
  continuationHeadingHeight: number,
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
      cost += meta.isSectionStart ? SECTION_GAP : ENTRY_GAP;
    }

    if (!isFirstOnPage && used + cost > MAIN_CONTENT_CAPACITY + OVERFLOW_TOLERANCE) {
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
  const metas = useMemo(() => buildMainBlockMetas(data), [data]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headingSampleRef = useRef<HTMLDivElement | null>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const [continuationHeadingHeight, setContinuationHeadingHeight] = useState(0);

  useLayoutEffect(() => {
    const measured = metas.map((_, index) => itemRefs.current[index]?.offsetHeight ?? 0);
    setHeights(measured);
    setContinuationHeadingHeight(headingSampleRef.current?.offsetHeight ?? 0);
  }, [metas, dictionary]);

  const pages = useMemo<PageBlock[][]>(() => {
    if (heights.length !== metas.length) return [[]];
    return paginateBlocks(metas, heights, continuationHeadingHeight);
  }, [metas, heights, continuationHeadingHeight]);

  return {
    pages,
    metas,
    itemRefs,
    headingSampleRef,
    isMeasuring: heights.length !== metas.length,
  };
}
