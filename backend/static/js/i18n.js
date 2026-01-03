// Simple i18n implementation for EasyTodo
(function(){
  const STORAGE_KEY = 'language';
  const DEFAULT_LANGUAGE = 'zh-CN';
  const LOCALES_PATH = '/static/js/locales';
  
  let currentLang = DEFAULT_LANGUAGE;
  let initialized = false;
  let loadingPromise = null;
  
  // Load available locale files dynamically
  async function loadAvailableLocales() {
    if (loadingPromise) return loadingPromise;
    
    loadingPromise = (async () => {
      try {
        // Try to fetch the list of locale files
        const response = await fetch(`${LOCALES_PATH}/index.json`);
        if (response.ok) {
          const locales = await response.json();
          await loadLocaleFiles(locales);
        } else {
          // Fallback: try to load common locales
          await loadLocaleFiles(['zh-CN', 'en', 'ja']);
        }
      } catch (e) {
        console.warn('[i18n] Failed to load locale list, trying fallback locales');
        // Fallback: try to load common locales
        await loadLocaleFiles(['zh-CN', 'en', 'ja']);
      }
    })();
    
    return loadingPromise;
  }
  
  // Load locale files
  async function loadLocaleFiles(locales) {
    const promises = locales.map(locale => loadLocaleFile(locale));
    await Promise.allSettled(promises);
  }
  
  // Load a single locale file
  async function loadLocaleFile(locale) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${LOCALES_PATH}/${locale}.js`;
      script.async = true;
      
      script.onload = () => {
        console.log(`[i18n] Loaded locale: ${locale}`);
        resolve();
      };
      
      script.onerror = () => {
        console.warn(`[i18n] Failed to load locale: ${locale}`);
        reject(new Error(`Failed to load ${locale}`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Get resources
  function getResources() {
    return window.i18nLocales || {};
  }
  
  // Get available languages
  function getAvailableLanguages() {
    return Object.keys(getResources());
  }
  
  // Detect browser language
  function detectLanguage() {
    const langs = getAvailableLanguages();
    if (langs.length === 0) return DEFAULT_LANGUAGE;
    
    // Check localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && langs.includes(stored)) return stored;
    } catch (e) {}
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage || '';
    if (langs.includes(browserLang)) return browserLang;
    
    // Check language prefix (e.g., 'zh' from 'zh-CN')
    const prefix = browserLang.split('-')[0];
    const match = langs.find(l => l.startsWith(prefix));
    if (match) return match;
    
    // Fallback
    return langs.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : langs[0];
  }
  
  // Translation function
  function t(key, fallback) {
    const resources = getResources();
    const langData = resources[currentLang];
    
    if (!langData || !langData.translation) {
      return fallback || key;
    }
    
    const translations = langData.translation;
    
    // First, try direct key lookup (flat structure: 'login.header')
    if (key in translations) {
      return translations[key];
    }
    
    // Then try nested structure (login: { header: '...' })
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return (typeof value === 'string') ? value : (fallback || key);
  }
  
  // Apply translations to page
  function applyLanguage() {
    if (!document.body) return;
    
    // Check if we have valid translations
    const resources = getResources();
    const hasTranslations = resources[currentLang] && resources[currentLang].translation;
    
    if (!hasTranslations) return;
    
    // Update title
    const titleKey = document.body.getAttribute('data-title-key');
    if (titleKey) {
      const titleTranslation = t(titleKey);
      if (titleTranslation !== titleKey) {
        document.title = titleTranslation;
      }
    }
    
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      
      const translation = t(key);
      if (translation !== key) {
        el.textContent = translation;
      }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      
      const translation = t(key);
      if (translation !== key) {
        el.placeholder = translation;
      }
    });
    
    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (!key) return;
      
      const translation = t(key);
      if (translation !== key) {
        el.title = translation;
      }
    });
    
    // Update aria-labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (!key) return;
      
      const translation = t(key);
      if (translation !== key) {
        el.setAttribute('aria-label', translation);
      }
    });
    
    // Update html lang
    document.documentElement.setAttribute('lang', currentLang);
    
    // Apply language-specific font if configured
    applyLanguageFont();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang: currentLang } 
    }));
  }
  
  // Apply language-specific font
  function applyLanguageFont() {
    const resources = getResources();
    const langData = resources[currentLang];
    
    if (!langData) return;
    
    // Remove any existing language font style
    const existingStyle = document.getElementById('i18n-font-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    const existingLink = document.getElementById('i18n-font-link');
    if (existingLink) {
      existingLink.remove();
    }
    
    // Check for font configuration
    const fontFamily = langData.fontFamily;
    const fontUrl = langData.fontUrl; // direct font file or stylesheet
    const fontCssUrl = langData.fontCssUrl; // explicitly a stylesheet with @font-face
    
    if (!fontFamily && !fontUrl && !fontCssUrl) return;

    // If we have a stylesheet URL (explicit or inferred by .css), inject link
    const stylesheetUrl = fontCssUrl || (fontUrl && fontUrl.includes('.css') ? fontUrl : null);
    if (stylesheetUrl) {
      const link = document.createElement('link');
      link.id = 'i18n-font-link';
      link.rel = 'stylesheet';
      link.href = addCacheBuster(stylesheetUrl);
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // If fontFamily is provided, optionally add @font-face when fontUrl points to a font file
    if (fontFamily) {
      const style = document.createElement('style');
      style.id = 'i18n-font-style';
      let css = '';
      
      // Only add @font-face when fontUrl is a direct font resource (not a stylesheet)
      const isFontFile = fontUrl && !fontUrl.includes('.css');
      if (isFontFile) {
        css += `
@font-face {
  font-family: '${fontFamily}';
  src: url('${fontUrl}');
  font-display: swap;
}
`;
      }
      
      css += `
body {
  font-family: ${fontFamily}, ui-sans-serif, system-ui, -apple-system, sans-serif !important;
}
`;
      
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  function addCacheBuster(url) {
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.set('v', Date.now().toString());
      return u.toString();
    } catch (e) {
      // Fallback: simple concat
      const sep = url.includes('?') ? '&' : '?';
      return url + sep + 'v=' + Date.now();
    }
  }
  
  // Set language
  function setLanguage(lang) {
    const langs = getAvailableLanguages();
    if (!langs.includes(lang)) return;
    
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    
    applyLanguage();
  }
  
  // Get language name
  function getLanguageName(lang) {
    const resources = getResources();
    const langData = resources[lang];
    
    // Try to get language name from the language resource itself
    if (langData && langData.languageName) {
      return langData.languageName;
    }
    
    // Fallback to language code if not defined
    return lang;
  }
  
  // Show language dropdown
  function showLanguageDropdown(btn) {
    const existing = document.getElementById('language-dropdown');
    if (existing) {
      existing.remove();
      return;
    }
    
    const languages = getAvailableLanguages();
    if (languages.length <= 1) return;
    
    const dropdown = document.createElement('div');
    dropdown.id = 'language-dropdown';
    dropdown.className = 'language-dropdown';
    
    languages.forEach(lang => {
      const item = document.createElement('div');
      item.className = 'language-item' + (lang === currentLang ? ' active' : '');
      item.textContent = getLanguageName(lang);
      item.addEventListener('click', () => {
        setLanguage(lang);
        dropdown.remove();
        updateLanguageButton(btn);
      });
      dropdown.appendChild(item);
    });
    
    const rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    document.body.appendChild(dropdown);
    
    setTimeout(() => {
      const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      };
      document.addEventListener('click', closeDropdown);
    }, 0);
  }
  
  // Update language button
  function updateLanguageButton(btn) {
    if (!btn) return;
    const langName = getLanguageName(currentLang);
    btn.title = t('index.language') + ' · ' + langName;
  }
  
  // Initialize language button
  function initLanguageButton() {
    const btn = document.getElementById('languageBtn');
    if (!btn) return;
    
    // Ensure language is initialized
    if (getAvailableLanguages().length > 0 && !initialized) {
      init();
    }
    
    // Only update button, don't re-apply all translations
    updateLanguageButton(btn);
    
    // Remove any existing click listeners to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLanguageDropdown(newBtn);
    });
  }
  
  // Toggle language (for backward compatibility)
  function toggleLanguage() {
    const languages = getAvailableLanguages();
    if (languages.length <= 1) return;
    
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  }
  
  // Initialize
  async function init() {
    if (initialized) return true;
    
    // Load locale files first
    await loadAvailableLocales();
    
    const langs = getAvailableLanguages();
    if (langs.length === 0) return false;
    
    currentLang = detectLanguage();
    initialized = true;
    applyLanguage();
    return true;
  }
  
  // Try to initialize with async support
  async function tryInit() {
    try {
      await init();
    } catch (e) {
      console.error('[i18n] Initialization failed:', e);
    }
  }
  
  // Export API
  window.i18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    toggleLanguage,
    applyLanguage,
    updateLanguageButton,
    initLanguageButton,
    init,
    loadAvailableLocales
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
