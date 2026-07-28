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
