import SettingsPanel from './SettingsPanel'

function SettingsView({ language, theme, onLanguageChange, onThemeChange, title }) {
  return (
    <>
      <h1>{title}</h1>
      <SettingsPanel
        language={language}
        theme={theme}
        onLanguageChange={onLanguageChange}
        onThemeChange={onThemeChange}
      />
    
    </>
  )
}

export default SettingsView
