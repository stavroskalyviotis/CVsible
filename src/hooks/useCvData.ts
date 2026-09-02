import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CvData, ContactItem, PersonalInfo, SectionKey } from "../types";
import { normalizeCvData } from "../data/normalize";
import { loadCvData, saveCvData } from "../utils/storage";

type ListKey =
  | "experience"
  | "education"
  | "skills"
  | "softSkills"
  | "languages"
  | "interests"
  | "certifications"
  | "projects";

const HISTORY_LIMIT = 50;
// Rapid edits (keystrokes) collapse into one undo step; a pause this long
// closes the step, the same way most text editors group typing bursts.
const COALESCE_MS = 600;

function reorderList<T extends { id: string }>(list: T[], sourceId: string, targetId: string): T[] {
  const sourceIndex = list.findIndex((entry) => entry.id === sourceId);
  const targetIndex = list.findIndex((entry) => entry.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return list;
  const next = [...list];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

function reorderValues<T>(list: T[], source: T, target: T): T[] {
  const sourceIndex = list.indexOf(source);
  const targetIndex = list.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return list;
  const next = [...list];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

function makeListHelpers<K extends ListKey>(setData: Dispatch<SetStateAction<CvData>>, key: K) {
  type Item = CvData[K][number];

  return {
    add: (item: Item) =>
      setData((prev) => ({ ...prev, [key]: [...prev[key], item] }) as CvData),
    update: (id: string, patch: Partial<Item>) =>
      setData(
        (prev) =>
          ({
            ...prev,
            [key]: prev[key].map((entry: Item) =>
              entry.id === id ? { ...entry, ...patch } : entry,
            ),
          }) as CvData,
      ),
    remove: (id: string) =>
      setData(
        (prev) =>
          ({ ...prev, [key]: prev[key].filter((entry: Item) => entry.id !== id) }) as CvData,
      ),
    move: (id: string, direction: -1 | 1) =>
      setData((prev) => {
        const list = prev[key] as Item[];
        const index = list.findIndex((entry) => entry.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return prev;
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        return { ...prev, [key]: next } as CvData;
      }),
    reorder: (sourceId: string, targetId: string) =>
      setData((prev) => ({ ...prev, [key]: reorderList(prev[key] as Item[], sourceId, targetId) }) as CvData),
  };
}

function makeContactHelpers(setData: Dispatch<SetStateAction<CvData>>) {
  return {
    add: (item: ContactItem) =>
      setData((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, contacts: [...prev.personalInfo.contacts, item] },
      })),
    update: (id: string, patch: Partial<ContactItem>) =>
      setData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contacts: prev.personalInfo.contacts.map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry,
          ),
        },
      })),
    remove: (id: string) =>
      setData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contacts: prev.personalInfo.contacts.filter((entry) => entry.id !== id),
        },
      })),
    move: (id: string, direction: -1 | 1) =>
      setData((prev) => {
        const list = prev.personalInfo.contacts;
        const index = list.findIndex((entry) => entry.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return prev;
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        return { ...prev, personalInfo: { ...prev.personalInfo, contacts: next } };
      }),
    reorder: (sourceId: string, targetId: string) =>
      setData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contacts: reorderList(prev.personalInfo.contacts, sourceId, targetId),
        },
      })),
  };
}

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
