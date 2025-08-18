// src/utils/translate.js
export function setLanguage(langCode) {
    // Google injects a <select.goog-te-combo>; we set it + dispatch change
    const select = document.querySelector('.goog-te-combo');
    if (!select) return false;
  
    // Some language codes differ (e.g., "zh-CN"). Use exact values you included.
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
    // Keep a preference so you can re-apply on route changes
    try { localStorage.setItem('preferredLang', langCode); } catch {}
    return true;
  }
  
  export function reapplyPreferredLanguage() {
    try {
      const v = localStorage.getItem('preferredLang');
      if (v && v !== 'en') setLanguage(v);
    } catch {}
  }
  
  export function onGoogleComboReady(cb, { timeoutMs = 8000 } = {}) {
    const existing = document.querySelector('.goog-te-combo');
    if (existing) { cb(existing); return; }
  
    const obs = new MutationObserver(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        obs.disconnect();
        cb(select);
      }
    });
  
    obs.observe(document.documentElement, { childList: true, subtree: true });
  
    // Safety timeout
    setTimeout(() => obs.disconnect(), timeoutMs);
  }
  