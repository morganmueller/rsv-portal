// src/components/contentUtils/LanguageToggle.jsx
import React, { useEffect, useState } from "react";
import {
  onGoogleComboReady,
  setLanguage,
  reapplyPreferredLanguage,
} from "../../utils/translate";

const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "zh-CN", label: "中文" },
  { value: "ru", label: "Русский" },
  { value: "ar", label: "العربية" },
  { value: "bn", label: "বাংলা" },
];

/**
 * Props:
 * - className:      applied to the <select> (so your .language-select styles hit the control)
 * - wrapperClassName: optional class for the outer <label> if you want layout styling there
 */
export default function LanguageToggle({ className = "", wrapperClassName = "" }) {
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem("preferredLang") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    onGoogleComboReady(() => {
      setReady(true);
      // Reapply a stored preference once the Google widget is present
      reapplyPreferredLanguage();
    });
  }, []);

  const handleChange = (e) => {
    const lang = e.target.value;
    setValue(lang);

    // If the widget isn't ready yet, cache the preference and it will reapply later.
    if (!setLanguage(lang)) {
      try {
        localStorage.setItem("preferredLang", lang);
      } catch {}
    }
  };

  return (
    <label
      className={wrapperClassName}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <span className="sr-only">Select language</span>

      <select
        className={className}                  // ← apply your .language-select here
        aria-label="Select language"
        value={value}
        onChange={handleChange}
        disabled={!ready && value !== "en"}    // allow English before widget loads
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--gray-300, #d1d5db)",
          fontSize: 14,
          // Keep these inline to guarantee pointer + visibility regardless of theme
          cursor: "pointer",
        }}
      >
        {LANG_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
