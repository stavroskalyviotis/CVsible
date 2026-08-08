import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CvData, ContactItem, PersonalInfo } from "../types";
import { createEmptyCvData } from "../data/defaultData";
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

function normalizeCvData(stored: Partial<CvData> | null): CvData {
  const base = createEmptyCvData();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    personalInfo: {
      ...base.personalInfo,
      ...stored.personalInfo,
      contacts: Array.isArray(stored.personalInfo?.contacts)
        ? stored.personalInfo.contacts
        : base.personalInfo.contacts,
    },
    softSkills: Array.isArray(stored.softSkills) ? stored.softSkills : base.softSkills,
    interests: Array.isArray(stored.interests) ? stored.interests : base.interests,
    sidebarOrder: Array.isArray(stored.sidebarOrder) ? stored.sidebarOrder : base.sidebarOrder,
    mainOrder: Array.isArray(stored.mainOrder) ? stored.mainOrder : base.mainOrder,
  };
}

export function useCvData() {
  const [data, setData] = useState<CvData>(() => normalizeCvData(loadCvData<Partial<CvData>>()));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveCvData(data);
  }, [data]);

  const updatePersonalInfo = (patch: Partial<PersonalInfo>) =>
    setData((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...patch } }));

  const setThemeColor = (themeColor: string) => setData((prev) => ({ ...prev, themeColor }));
  const setPhoto = (photo: string | null) => setData((prev) => ({ ...prev, photo }));
  const setPhotoPosition = (photoPosition: CvData["photoPosition"]) =>
    setData((prev) => ({ ...prev, photoPosition }));
  const setShowPhoto = (showPhoto: boolean) => setData((prev) => ({ ...prev, showPhoto }));
  const setFontFamily = (fontFamily: CvData["fontFamily"]) => setData((prev) => ({ ...prev, fontFamily }));
  const setDensity = (density: CvData["density"]) => setData((prev) => ({ ...prev, density }));
  const replaceAll = (next: CvData) => setData(next);

  const reorderSidebarSection = (source: CvData["sidebarOrder"][number], target: CvData["sidebarOrder"][number]) =>
    setData((prev) => ({ ...prev, sidebarOrder: reorderValues(prev.sidebarOrder, source, target) }));

  const reorderMainSection = (source: CvData["mainOrder"][number], target: CvData["mainOrder"][number]) =>
    setData((prev) => ({ ...prev, mainOrder: reorderValues(prev.mainOrder, source, target) }));

  return {
    data,
    updatePersonalInfo,
    setThemeColor,
    setPhoto,
    setPhotoPosition,
    setShowPhoto,
    setFontFamily,
    setDensity,
    reorderSidebarSection,
    reorderMainSection,
    replaceAll,
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
