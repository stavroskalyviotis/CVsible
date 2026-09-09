import { useEffect, useRef, useState } from "react";
import type { CvData, PersonalInfo, SectionKey } from "../types";
import { normalizeCvData } from "../data/normalize";
import { makeContactHelpers, makeListHelpers, reorderValues } from "../utils/listHelpers";
import { loadCvData, saveCvData } from "../utils/storage";

const HISTORY_LIMIT = 50;
// Rapid edits (keystrokes) collapse into one undo step; a pause this long
// closes the step, the same way most text editors group typing bursts.
const COALESCE_MS = 600;

export function useCvData() {
  const [data, setData] = useState<CvData>(() => normalizeCvData(loadCvData<Partial<CvData>>()));
  const [past, setPast] = useState<CvData[]>([]);
  const [future, setFuture] = useState<CvData[]>([]);
  const [hasPendingEdit, setHasPendingEdit] = useState(false);

  // Refs only ever touched from effects/handlers, never read during render —
  // they track state that doesn't need to trigger a re-render on its own.
  const lastCommitted = useRef(data);
  const pendingBefore = useRef<CvData | null>(null);
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);
  const skipNextEffect = useRef(false);

  useEffect(() => {
    // Nothing actually changed since the last commit: either this is the
    // very first mount (lastCommitted was seeded with the initial data), or
    // React StrictMode is re-running this effect against the same data as
    // part of its dev-only mount/cleanup/remount simulation. A ref-based
    // "is this the first run" flag doesn't survive that simulated remount,
    // so compare the data itself instead of trusting a run counter.
    if (data === lastCommitted.current) return;

    saveCvData(data);

    if (skipNextEffect.current) {
      skipNextEffect.current = false;
      lastCommitted.current = data;
      return;
    }

    // A burst of rapid edits (keystrokes) collapses into one undo step: only
    // the state from before the burst started gets queued as a checkpoint.
    if (!pendingBefore.current) {
      pendingBefore.current = lastCommitted.current;
      setHasPendingEdit(true);
    }
    lastCommitted.current = data;
    setFuture([]);

    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      if (pendingBefore.current) {
        const before = pendingBefore.current;
        pendingBefore.current = null;
        setPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), before]);
        setHasPendingEdit(false);
      }
    }, COALESCE_MS);
  }, [data]);

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const undo = () => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    let target: CvData | null = null;
    if (pendingBefore.current) {
      target = pendingBefore.current;
      pendingBefore.current = null;
      setHasPendingEdit(false);
    } else if (past.length > 0) {
      target = past[past.length - 1];
      setPast((prev) => prev.slice(0, -1));
    }
    if (!target) return;
    skipNextEffect.current = true;
    setFuture((prev) => [...prev, data].slice(-HISTORY_LIMIT));
    setData(target);
  };

  const redo = () => {
    if (future.length === 0) return;
    const target = future[future.length - 1];
    setFuture((prev) => prev.slice(0, -1));
    skipNextEffect.current = true;
    setPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), data]);
    setData(target);
  };

  const updatePersonalInfo = (patch: Partial<PersonalInfo>) =>
    setData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...patch } }));

  const setThemeColor = (themeColor: string) => setData((prev) => ({ ...prev, themeColor }));
  const setPhoto = (photo: string | null) => setData((prev) => ({ ...prev, photo }));
  const setPhotoPosition = (photoPosition: CvData["photoPosition"]) =>
    setData((prev) => ({ ...prev, photoPosition }));
  const setShowPhoto = (showPhoto: boolean) => setData((prev) => ({ ...prev, showPhoto }));
  const setFontFamily = (fontFamily: CvData["fontFamily"]) => setData((prev) => ({ ...prev, fontFamily }));
  const setDensity = (density: CvData["density"]) => setData((prev) => ({ ...prev, density }));
  const setTemplate = (template: CvData["template"]) => setData((prev) => ({ ...prev, template }));
  const setSkillDisplay = (skillDisplay: CvData["skillDisplay"]) =>
    setData((prev) => ({ ...prev, skillDisplay }));
  const replaceAll = (next: CvData) => setData(normalizeCvData(next));

  const reorderSection = (source: SectionKey, target: SectionKey) =>
    setData((prev) => ({ ...prev, sectionOrder: reorderValues(prev.sectionOrder, source, target) }));

  return {
    data,
    updatePersonalInfo,
    setThemeColor,
    setPhoto,
    setPhotoPosition,
    setShowPhoto,
    setFontFamily,
    setDensity,
    setTemplate,
    setSkillDisplay,
    reorderSection,
    replaceAll,
    undo,
    redo,
    canUndo: past.length > 0 || hasPendingEdit,
    canRedo: future.length > 0,
    contacts: makeContactHelpers(setData),
    experience: makeListHelpers(setData, "experience"),
    education: makeListHelpers(setData, "education"),
    skills: makeListHelpers(setData, "skills"),
    softSkills: makeListHelpers(setData, "softSkills"),
    languages: makeListHelpers(setData, "languages"),
    interests: makeListHelpers(setData, "interests"),
    certifications: makeListHelpers(setData, "certifications"),
    projects: makeListHelpers(setData, "projects"),
  };
}

export type CvDataController = ReturnType<typeof useCvData>;
