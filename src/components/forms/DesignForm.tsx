import type { Dictionary } from "../../i18n/translations";
import type { Density, FontFamily } from "../../types";
import { THEME_PRESETS } from "../../data/themeColors";
import "./DesignForm.css";

const DENSITY_OPTIONS: Density[] = ["compact", "comfortable", "spacious"];
const FONT_OPTIONS: FontFamily[] = ["sans", "serif", "condensed"];

const DENSITY_LABEL_KEY: Record<Density, "densityCompact" | "densityComfortable" | "densitySpacious"> = {
  compact: "densityCompact",
  comfortable: "densityComfortable",
  spacious: "densitySpacious",
};

const FONT_LABEL_KEY: Record<FontFamily, "fontSans" | "fontSerif" | "fontCondensed"> = {
  sans: "fontSans",
  serif: "fontSerif",
  condensed: "fontCondensed",
};

export function DesignForm({
  themeColor,
  onColorChange,
  density,
  onDensityChange,
  fontFamily,
  onFontFamilyChange,
  dictionary,
}: {
  themeColor: string;
  onColorChange: (color: string) => void;
  density: Density;
  onDensityChange: (density: Density) => void;
  fontFamily: FontFamily;
  onFontFamilyChange: (fontFamily: FontFamily) => void;
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
            onClick={() => onColorChange(preset.color)}
          />
        ))}
        <label
          className={`color-swatch color-swatch-custom ${!isPreset ? "active" : ""}`}
          title={dictionary.actions.customColor}
        >
          <input type="color" value={themeColor} onChange={(e) => onColorChange(e.target.value)} />
        </label>
      </div>

      <p className="design-label">{dictionary.appearance.density}</p>
      <div className="segmented-control">
        {DENSITY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={density === option ? "active" : ""}
            onClick={() => onDensityChange(option)}
          >
            {dictionary.appearance[DENSITY_LABEL_KEY[option]]}
          </button>
        ))}
      </div>

      <p className="design-label">{dictionary.appearance.fontFamily}</p>
      <div className="segmented-control">
        {FONT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={fontFamily === option ? "active" : ""}
            onClick={() => onFontFamilyChange(option)}
          >
            {dictionary.appearance[FONT_LABEL_KEY[option]]}
          </button>
        ))}
      </div>
    </div>
  );
}
