import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PersonalInfo, ProfileListKey, UserProfile } from "../types";
import { createEmptyProfile } from "../data/defaultData";
import { useAuth } from "../auth/useAuth";
import { isCloudConfigured } from "../lib/supabaseClient";
import { makeContactHelpers, makeListHelpers } from "../utils/listHelpers";
import { fetchProfile, saveProfile } from "./profileStore";

export type ProfileStatus = "signed-out" | "loading" | "ready" | "saving" | "saved" | "error";

/** Long enough that a burst of typing is one write, short enough that leaving
 *  the page right after an edit still lands it. */
const SAVE_DEBOUNCE_MS = 900;

/** Loads the signed-in user's master profile and keeps it saved.
 *
 *  The profile lives only in the cloud: it belongs to a person, not to a
 *  device, and a signed-out visitor has nowhere to put one. Callers get
 *  `null` until it has loaded, and `status` says why.
 *
 *  The loaded profile is stored together with the user id it belongs to, and
 *  every reported state is derived from that during render rather than pushed
 *  in from an effect. Signing out, or signing in as someone else, therefore
 *  cannot leave the previous account's profile on screen for a frame. */
export function useProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // `saved` is the copy last known to be in the database. It lives in state
  // rather than a ref because whether the profile is dirty decides what the
  // save indicator renders, and refs must not be read during render.
  const [entry, setEntry] = useState<{ userId: string; profile: UserProfile; saved: UserProfile } | null>(null);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  const timer = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isCloudConfigured || !userId) return;

    let cancelled = false;
    fetchProfile()
      .then((loaded) => {
        if (cancelled) return;
        // No row yet is the normal first-visit state, not a failure.
        const next = loaded ?? createEmptyProfile();
        setEntry({ userId, profile: next, saved: next });
      })
      .catch(() => {
        if (!cancelled) setFailedFor(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isCurrent = entry !== null && entry.userId === userId;
  const profile = isCurrent ? entry.profile : null;
  const isDirty = isCurrent && entry.profile !== entry.saved;

  const status: ProfileStatus = !isCloudConfigured || !userId
    ? "signed-out"
    : !isCurrent
      ? failedFor === userId
        ? "error"
        : "loading"
      : saveFailed
        ? "error"
        : isDirty
          ? "saving"
          : saveCount > 0
            ? "saved"
            : "ready";

  useEffect(() => {
    if (!userId || !profile || !isDirty) return;

    const snapshot = profile;
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      saveProfile(userId, snapshot)
        .then(() => {
          // Only clears the dirty flag if nothing was typed while the write
          // was in flight; otherwise the newer edit stays pending and the
          // effect schedules the next save.
          setEntry((prev) => (prev && prev.profile === snapshot ? { ...prev, saved: snapshot } : prev));
          setSaveFailed(false);
          setSaveCount((count) => count + 1);
        })
        .catch(() => setSaveFailed(true));
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    };
  }, [profile, isDirty, userId]);

  // The forms are written against an always-present document, so they are
  // handed a setter that simply does nothing until the profile has loaded.
  const setProfile = useMemo<Dispatch<SetStateAction<UserProfile>>>(
    () => (update) =>
      setEntry((prev) =>
        prev
          ? {
              ...prev,
              profile: typeof update === "function" ? (update as (value: UserProfile) => UserProfile)(prev.profile) : update,
            }
          : prev,
      ),
    [],
  );

  const updatePersonalInfo = useCallback(
    (patch: Partial<PersonalInfo>) =>
      setProfile((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...patch } })),
    [setProfile],
  );

  const setPhoto = useCallback((photo: string | null) => setProfile((prev) => ({ ...prev, photo })), [setProfile]);

  const setPhotoPosition = useCallback(
    (photoPosition: { x: number; y: number }) => setProfile((prev) => ({ ...prev, photoPosition })),
    [setProfile],
  );

  /** Appends entries the user chose to keep, from a CV back into the profile. */
  const addEntries = useCallback(
    <K extends ProfileListKey>(section: K, entries: UserProfile[K]) => {
      if (entries.length === 0) return;
      setProfile((prev) => ({ ...prev, [section]: [...prev[section], ...entries] }) as UserProfile);
    },
    [setProfile],
  );

  const lists = useMemo(
    () => ({
      contacts: makeContactHelpers(setProfile),
      experience: makeListHelpers(setProfile, "experience"),
      education: makeListHelpers(setProfile, "education"),
      skills: makeListHelpers(setProfile, "skills"),
      softSkills: makeListHelpers(setProfile, "softSkills"),
      languages: makeListHelpers(setProfile, "languages"),
      interests: makeListHelpers(setProfile, "interests"),
      certifications: makeListHelpers(setProfile, "certifications"),
      projects: makeListHelpers(setProfile, "projects"),
    }),
    [setProfile],
  );

  return { profile, status, updatePersonalInfo, setPhoto, setPhotoPosition, addEntries, ...lists };
}

export type ProfileController = ReturnType<typeof useProfile>;
