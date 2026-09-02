import { useState } from "react";
import type { Dictionary } from "../i18n/translations";
import { Icon } from "../components/Icon";
import type { ApplicationEntry, ApplicationStatus } from "./cvStore";
import "./CvHistoryPanel.css";

const STATUS_ORDER: ApplicationStatus[] = ["sent", "interviewing", "offer", "rejected", "no_response"];

const EMPTY_FORM = { company: "", role: "", date: "", status: "sent" as ApplicationStatus, note: "", url: "" };

/** Per-CV application tracker: never shown in the exported PDF, purely for
 *  the user to remember where/when they applied and how it went. */
export function CvHistoryPanel({
  entries,
  dictionary,
  onChange,
}: {
  entries: ApplicationEntry[];
  dictionary: Dictionary;
  onChange: (next: ApplicationEntry[]) => void;
}) {
  const copy = dictionary.cvHistory;
  const [form, setForm] = useState(EMPTY_FORM);

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: entries.filter((entry) => entry.status === status).length,
  })).filter((entry) => entry.count > 0);

  const addEntry = () => {
    if (!form.company.trim()) return;
    const entry: ApplicationEntry = {
      id: crypto.randomUUID(),
      company: form.company.trim(),
      role: form.role.trim(),
      date: form.date || new Date().toISOString().slice(0, 10),
      status: form.status,
      note: form.note.trim() || undefined,
      url: form.url.trim() || undefined,
    };
    onChange([...entries, entry]);
    setForm(EMPTY_FORM);
  };

  const removeEntry = (id: string) => onChange(entries.filter((entry) => entry.id !== id));
  const updateStatus = (id: string, status: ApplicationStatus) =>
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, status } : entry)));

  return (
    <div className="cv-history-panel">
      {counts.length > 0 && (
        <div className="cv-history-stats">
          {counts.map(({ status, count }) => (
            <span key={status} className={`cv-history-stat ${status}`}>
              {count} {copy.status[status]}
            </span>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="cv-history-empty">{copy.empty}</p>
      ) : (
        <ul className="cv-history-list">
          {sorted.map((entry) => (
            <li key={entry.id}>
              <div className="cv-history-row-main">
                <strong>{entry.company}</strong>
                {entry.role && <span className="cv-history-role">{entry.role}</span>}
                <span className="cv-history-date">{entry.date}</span>
              </div>
              <div className="cv-history-row-meta">
                <select
                  className={`cv-history-status ${entry.status}`}
                  value={entry.status}
                  onChange={(event) => updateStatus(entry.id, event.target.value as ApplicationStatus)}
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {copy.status[status]}
                    </option>
                  ))}
                </select>
                {entry.url && (
                  <a href={entry.url} target="_blank" rel="noopener noreferrer">
                    <Icon name="link" size={12} />
                    {copy.viewAd}
                  </a>
                )}
                <button type="button" onClick={() => removeEntry(entry.id)} aria-label={copy.add}>
                  <Icon name="trash" size={12} />
                </button>
              </div>
              {entry.note && <p className="cv-history-note">{entry.note}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="cv-history-form">
        <input
          placeholder={copy.company}
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
        />
        <input
          placeholder={copy.role}
          value={form.role}
          onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
        />
        <input
          type="date"
          aria-label={copy.date}
          value={form.date}
          onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
        />
        <select
          aria-label={copy.status.sent}
          value={form.status}
          onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ApplicationStatus }))}
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {copy.status[status]}
            </option>
          ))}
        </select>
        <input
          placeholder={copy.url}
          value={form.url}
          onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
        />
        <textarea
          placeholder={copy.note}
          value={form.note}
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
        />
        <button type="button" className="cv-history-add" onClick={addEntry} disabled={!form.company.trim()}>
          <Icon name="plus" size={13} />
          {copy.add}
        </button>
      </div>
    </div>
  );
}
