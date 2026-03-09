import BackendStatusCard from './BackendStatusCard'
import BoardView from './BoardView'
import LoginView from './LoginView'
import SettingsView from './SettingsView'
import WeatherForecastView from './WeatherForecastView'
import WeatherNationwideView from './WeatherNationwideView'
import WebMaskingView from './WebMaskingView'

function MainContent({
  activeView,
  status,
  response,
  language,
  theme,
  onLanguageChange,
  onThemeChange,
  text,
  authUser,
  authToken,
  onLoginSuccess,
  onRequireLogin,
}) {
  const contentByView = {
    dashboard: text.dashboard,
    tasks: text.tasks,
  }

  return (
    <main className="main-content">
      {activeView === 'settings' ? (
        <SettingsView
          language={language}
          theme={theme}
          onLanguageChange={onLanguageChange}
          onThemeChange={onThemeChange}
          title={text.settings}
          status={status}
          response={response}
        />
      ) : activeView === 'weather' ? (
        <WeatherForecastView title={text.weather} language={language} />
      ) : activeView === 'weatherAll' ? (
        <WeatherNationwideView title={text.weatherAll} language={language} />
      ) : activeView === 'webMasking' ? (
        <WebMaskingView title={text.webMasking} />
      ) : activeView === 'login' ? (
        <LoginView language={language} authUser={authUser} onLoginSuccess={onLoginSuccess} />
      ) : activeView === 'board' ? (
        <BoardView
          language={language}
          authUser={authUser}
          authToken={authToken}
          onRequireLogin={onRequireLogin}
        />
      ) : (
        <>
          <h1>{text.title}</h1>
          <p className="view-description">{contentByView[activeView]}</p>
          <BackendStatusCard status={status} response={response} />
        </>
      )}
    </main>
  )
}

export default MainContent
