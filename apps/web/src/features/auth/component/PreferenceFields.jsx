"use client";

import Chip from "../../../app/components/ui/Chip/Chip";
import { COLOR_OPTIONS, STYLE_OPTIONS } from "../../../lib/static-data";

/**
 * Shared preference chip selectors for style and color.
 * Used in: StepTwoReg (registration), PreferencesCard (profile).
 *
 * Props:
 *   pref_styles  – string[] of selected style values
 *   pref_colors  – string[] of selected color values
 *   onToggle     – (key: "pref_styles" | "pref_colors", value: string) => void
 */
export default function PreferenceFields({ pref_styles, pref_colors, onToggle }) {
  return (
    <>
      <div className="space-y-3">
        <div className="text-sm font-medium">Main Style Preference</div>
        <div className="flex flex-wrap gap-3">
          {STYLE_OPTIONS.map((style) => (
            <Chip
              key={style.value}
              label={style.label}
              selected={pref_styles.includes(style.value)}
              selectedBg="var(--ww-gray-dark)"
              selectedBorder="var(--ww-gray-dark)"
              onClick={() => onToggle("pref_styles", style.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Preferred Colors</div>
        <div className="flex flex-wrap gap-3">
          {COLOR_OPTIONS.map((color) => (
            <Chip
              key={color.value}
              label={color.label}
              selected={pref_colors.includes(color.value)}
              selectedBg={color.selectedBg}
              selectedText={color.selectedText}
              selectedBorder={color.selectedBorder}
              onClick={() => onToggle("pref_colors", color.value)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
