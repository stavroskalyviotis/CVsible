import type { CSSProperties } from "react";
import type { Dictionary } from "../../i18n/translations";
import type { Density, FontFamily, SkillDisplay, TemplateId } from "../../types";
import { THEME_PRESETS } from "../../data/themeColors";
import { TEMPLATE_IDS, TEMPLATES } from "../../templates/registry";
import "./DesignForm.css";

const DENSITY_OPTIONS: Density[] = ["compact", "comfortable", "spacious"];
const FONT_OPTIONS: FontFamily[] = ["sans", "serif", "condensed"];
const SKILL_DISPLAY_OPTIONS: SkillDisplay[] = ["text", "none"];

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

const SKILL_DISPLAY_LABEL_KEY: Record<SkillDisplay, "skillLevelText" | "skillLevelNone"> = {
  text: "skillLevelText",
  none: "skillLevelNone",
};

/** Tiny abstract preview of each layout, drawn with divs so it always matches
 *  the accent colour the user picked. */
function TemplateThumbnail({ id }: { id: TemplateId }) {
  if (id === "aurora") {
    return (
      <span className="tpl-thumb tpl-thumb-aurora">
        <span className="tpl-thumb-side" />
        <span className="tpl-thumb-main">
          <i className="tpl-rule" />
          <i />
          <i />
          <i className="tpl-rule" />
          <i />
        </span>
      </span>
    );
  }

  if (id === "meridian") {
    return (
      <span className="tpl-thumb tpl-thumb-meridian">
        <i className="tpl-title" />
        <i className="tpl-sub" />
        <i className="tpl-rule-dark" />
        <i />
        <i />
        <i className="tpl-rule-dark" />
        <i />
      </span>
    );
  }

  return (
    <span className="tpl-thumb tpl-thumb-atlas">
      <i className="tpl-title tpl-accent" />
      <i className="tpl-sub" />
      <i className="tpl-rule" />
      <i />
      <i />
      <i className="tpl-rule" />
      <i />
    </span>
  );
}

export function DesignForm({
  template,
  onTemplateChange,
  themeColor,
  onColorChange,
  density,
  onDensityChange,
  fontFamily,
  onFontFamilyChange,
  skillDisplay,
  onSkillDisplayChange,
  dictionary,
}: {
  template: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
  themeColor: string;
  onColorChange: (color: string) => void;
  density: Density;
  onDensityChange: (density: Density) => void;
  fontFamily: FontFamily;
  onFontFamilyChange: (fontFamily: FontFamily) => void;
  skillDisplay: SkillDisplay;
  onSkillDisplayChange: (display: SkillDisplay) => void;
  dictionary: Dictionary;
}) {
  const isPreset = THEME_PRESETS.some((preset) => preset.color === themeColor);

  return (
    <div className="design-form">
      <p className="design-label">{dictionary.templates.title}</p>
      <div className="template-grid" style={{ "--tpl-accent": themeColor } as CSSProperties}>
        {TEMPLATE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`template-card ${template === id ? "active" : ""}`}
            onClick={() => onTemplateChange(id)}
            aria-pressed={template === id}
          >
            <TemplateThumbnail id={id} />
            <span className="template-card-body">
              <span className="template-card-name">
                {dictionary.templates[id].name}
                {TEMPLATES[id].atsSafe && (
                  <span className="template-ats-badge">{dictionary.templates.atsBadge}</span>
                )}
              </span>
              <span className="template-card-desc">{dictionary.templates[id].description}</span>
            </span>
          </button>
        ))}
      </div>

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

      <p className="design-label">{dictionary.appearance.skillLevel}</p>
      <div className="segmented-control">
        {SKILL_DISPLAY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={skillDisplay === option ? "active" : ""}
            onClick={() => onSkillDisplayChange(option)}
          >
            {dictionary.appearance[SKILL_DISPLAY_LABEL_KEY[option]]}
          </button>
        ))}
      </div>
    </div>
  );
}
