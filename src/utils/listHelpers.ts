import type { Dispatch, SetStateAction } from "react";
import type { ContactItem, PersonalInfo } from "../types";

/** Add/update/remove/move/reorder over one keyed list inside a state object.
 *
 *  Shared by the CV editor and the master profile: both hold the same entry
 *  types in the same shaped lists, and the forms are reused across the two,
 *  so the actions they are handed have to behave identically. */

export function reorderList<T extends { id: string }>(list: T[], sourceId: string, targetId: string): T[] {
  const sourceIndex = list.findIndex((entry) => entry.id === sourceId);
  const targetIndex = list.findIndex((entry) => entry.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return list;
  const next = [...list];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function reorderValues<T>(list: T[], source: T, target: T): T[] {
  const sourceIndex = list.indexOf(source);
  const targetIndex = list.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return list;
  const next = [...list];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export interface ListActions<Item> {
  add: (item: Item) => void;
  update: (id: string, patch: Partial<Item>) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  reorder: (sourceId: string, targetId: string) => void;
}

export function makeListHelpers<TData, K extends keyof TData>(
  setData: Dispatch<SetStateAction<TData>>,
  key: K,
): ListActions<TData[K] extends readonly (infer U)[] ? U : never> {
  type Item = (TData[K] extends readonly (infer U)[] ? U : never) & { id: string };

  const read = (data: TData) => data[key] as readonly Item[];
  const write = (data: TData, next: Item[]) => ({ ...data, [key]: next }) as TData;

  return {
    add: (item) => setData((prev) => write(prev, [...read(prev), item as Item])),
    update: (id, patch) =>
      setData((prev) => write(prev, read(prev).map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))),
    remove: (id) => setData((prev) => write(prev, read(prev).filter((entry) => entry.id !== id))),
    move: (id, direction) =>
      setData((prev) => {
        const list = read(prev);
        const index = list.findIndex((entry) => entry.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return prev;
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        return write(prev, next);
      }),
    reorder: (sourceId, targetId) => setData((prev) => write(prev, reorderList([...read(prev)], sourceId, targetId))),
  };
}

/** The contact rows live one level down, under personalInfo, so they need
 *  their own writer — the shape is identical in a CV and in the profile. */
export function makeContactHelpers<TData extends { personalInfo: PersonalInfo }>(
  setData: Dispatch<SetStateAction<TData>>,
): ListActions<ContactItem> {
  const write = (data: TData, contacts: ContactItem[]) =>
    ({ ...data, personalInfo: { ...data.personalInfo, contacts } }) as TData;

  return {
    add: (item) => setData((prev) => write(prev, [...prev.personalInfo.contacts, item])),
    update: (id, patch) =>
      setData((prev) =>
        write(
          prev,
          prev.personalInfo.contacts.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        ),
      ),
    remove: (id) => setData((prev) => write(prev, prev.personalInfo.contacts.filter((entry) => entry.id !== id))),
    move: (id, direction) =>
      setData((prev) => {
        const list = prev.personalInfo.contacts;
        const index = list.findIndex((entry) => entry.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return prev;
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        return write(prev, next);
      }),
    reorder: (sourceId, targetId) =>
      setData((prev) => write(prev, reorderList(prev.personalInfo.contacts, sourceId, targetId))),
  };
}
