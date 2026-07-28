import { useEffect, useRef, useState } from "react";
import type { LanguageCode } from "../../types";
import { Icon } from "../Icon";
import "./MonthYearField.css";

const START_YEAR = 1970;

type Level = "decade" | "year" | "month";

function monthLabels(locale: LanguageCode): string[] {
  const formatter = new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-US", { month: "short" });
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2020, i, 1)));
}

function formatDisplay(value: string, locale: LanguageCode): string {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  const formatter = new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-US", {
    month: "short",
    year: "numeric",
  });
  return formatter.format(new Date(year, (month || 1) - 1, 1));
}

export function MonthYearField({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "—",
  locale,
  minValue,
  minValueMessage,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  locale: LanguageCode;
  minValue?: string;
  minValueMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<Level>("decade");
  const [decade, setDecade] = useState<number | null>(null);
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const [valueYear] = value ? value.split("-").map(Number) : [null];
  const [minYear, minMonth] = minValue ? minValue.split("-").map(Number) : [null, null];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const openPicker = () => {
    if (disabled) return;
    if (valueYear) {
      setPendingYear(valueYear);
      setDecade(Math.floor(valueYear / 10) * 10);
      setLevel("month");
    } else if (minYear) {
      setPendingYear(null);
      setDecade(Math.floor(minYear / 10) * 10);
      setLevel("year");
    } else {
      setLevel("decade");
      setDecade(null);
      setPendingYear(null);
    }
    setOpen(true);
  };

  const decades: number[] = [];
  for (let d = START_YEAR; d <= Math.floor(currentYear / 10) * 10 + 10; d += 10) decades.push(d);

  const goBack = () => {
    if (level === "month") setLevel("year");
    else if (level === "year") setLevel("decade");
  };

  const headerLabel =
    level === "decade" ? "" : level === "year" ? `${decade}s` : String(pendingYear);

  return (
    <div className="month-year-field" ref={containerRef}>
      <span className="month-year-label">{label}</span>
      <button
        type="button"
        className="month-year-trigger"
        onClick={openPicker}
        disabled={disabled}
      >
        {value ? formatDisplay(value, locale) : placeholder}
      </button>

      {open && (
        <div className="month-year-popover">
          <div className="month-year-popover-head">
            {level !== "decade" && (
              <button type="button" className="month-year-back" onClick={goBack}>
                <Icon name="arrow-left" size={13} />
              </button>
            )}
            <span>{headerLabel}</span>
          </div>

          {level === "decade" && (
            <div className="month-year-grid decade-grid">
              {decades.map((d) => {
                const isDisabled = minYear !== null && d + 9 < minYear;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      setDecade(d);
                      setLevel("year");
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          )}

          {level === "year" && decade !== null && (
            <div className="month-year-grid year-grid">
              {Array.from({ length: 10 }, (_, i) => decade + i)
                .filter((y) => y <= currentYear + 5)
                .map((y) => {
                  const isDisabled = minYear !== null && y < minYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        setPendingYear(y);
                        setLevel("month");
                      }}
                    >
                      {y}
                    </button>
                  );
                })}
            </div>
          )}

          {level === "month" && pendingYear !== null && (
            <div className="month-year-grid month-grid">
              {monthLabels(locale).map((label, index) => {
                const isDisabled =
                  minYear !== null && minMonth !== null && pendingYear === minYear && index + 1 < minMonth;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(`${pendingYear}-${String(index + 1).padStart(2, "0")}`);
                      setOpen(false);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {minValue && minValueMessage && <p className="month-year-hint">{minValueMessage}</p>}
        </div>
      )}
    </div>
  );
}
