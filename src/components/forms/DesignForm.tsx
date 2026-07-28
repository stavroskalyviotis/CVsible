import type { Dictionary } from "../../i18n/translations";
import { THEME_PRESETS } from "../../data/themeColors";
import "./DesignForm.css";

export function DesignForm({
  themeColor,
  onChange,
  dictionary,
}: {
  themeColor: string;
  onChange: (color: string) => void;
  dictionary: Dictionary;
}) {
  const isPreset = THEME_PRESETS.some((preset) => preset.color === themeColor);

  return (
    <div className="design-form">
      <p className="design-label">{dictionary.actions.chooseColor}</p>
      <div className="color-swatches">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`color-swatch ${preset.color === themeColor ? "active" : ""}`}
            style={{ background: preset.color }}
            aria-label={preset.id}
            onClick={() => onChange(preset.color)}
          />
        ))}
        <label
          className={`color-swatch color-swatch-custom ${!isPreset ? "active" : ""}`}
          title={dictionary.actions.customColor}
        >
          <input type="color" value={themeColor} onChange={(e) => onChange(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
