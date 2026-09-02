const CV_DATA_KEY = "cvsible:cv-data";

export function loadCvData<T>(): T | null {
  try {
    const raw = localStorage.getItem(CV_DATA_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveCvData(data: unknown): void {
  try {
    localStorage.setItem(CV_DATA_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable, ignore
  }
}

const CLOUD_ID_KEY = "cvsible:cloud-cv-id";

/** Tracks which saved cloud CV (if any) the builder is currently editing, so
 *  "Save" can update that row instead of always creating a new one. */
export function getCurrentCloudId(): string | null {
  try {
    return localStorage.getItem(CLOUD_ID_KEY);
  } catch {
    return null;
  }
}

export function setCurrentCloudId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CLOUD_ID_KEY, id);
    else localStorage.removeItem(CLOUD_ID_KEY);
  } catch {
    // ignore
  }
}
