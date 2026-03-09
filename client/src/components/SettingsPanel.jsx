function SettingsPanel({ language, theme, onLanguageChange, onThemeChange }) {
  const textByLanguage = {
    ko: {
      languageLabel: '언어',
      themeLabel: '테마',
      themeOptions: [
        { value: 'light', label: '라이트', description: '밝고 깔끔한 기본 테마' },
        { value: 'dark', label: '다크', description: '눈부심을 줄인 어두운 테마' },
        { value: 'ocean', label: '오션', description: '차분한 블루 계열 테마' },
        { value: 'sunset', label: '선셋', description: '따뜻한 색감의 편안한 테마' },
      ],
    },
    en: {
      languageLabel: 'Language',
      themeLabel: 'Theme',
      themeOptions: [
        { value: 'light', label: 'Light', description: 'Bright and clean default' },
        { value: 'dark', label: 'Dark', description: 'Low-glare dark theme' },
        { value: 'ocean', label: 'Ocean', description: 'Calm blue palette' },
        { value: 'sunset', label: 'Sunset', description: 'Warm and comfortable palette' },
      ],
    },
  }

  const text = textByLanguage[language]

  return (
    <section className="settings-panel">
      <div className="settings-row">
        <label htmlFor="language-select">{text.languageLabel}</label>
        <select
          id="language-select"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="settings-row">
        <label>{text.themeLabel}</label>
        <div className="theme-preview-grid">
          {text.themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`theme-preview-layout ${option.value} ${theme === option.value ? 'selected' : ''}`}
              onClick={() => onThemeChange(option.value)}
              aria-pressed={theme === option.value}
            >
              <span className="theme-preview-title">{option.label}</span>
              <span className="theme-preview-description">{option.description}</span>
              <div className="theme-mini-layout">
                <div className="theme-mini-sidebar" />
                <div className="theme-mini-main">
                  <div className="theme-mini-header" />
                  <div className="theme-mini-card" />
                  <div className="theme-mini-line" />
                  <div className="theme-mini-line short" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SettingsPanel
