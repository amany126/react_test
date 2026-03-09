function Sidebar({ isSidebarOpen, onToggle, activeView, onSelectView, language, authUser, onLogout }) {
  const menuByLanguage = {
    ko: {
      menu: '메뉴',
      dashboard: '대시보드',
      tasks: '작업 목록',
      weather: '기상예보',
      weatherLocal: '지역 예보',
      weatherAll: '전체날씨',
      webMasking: '웹 마스킹',
      settings: '설정',
      board: '게시판',
      login: '로그인',
      logout: '로그아웃',
      notLoggedIn: '비로그인 상태',
    },
    en: {
      menu: 'Menu',
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      weather: 'Weather Forecast',
      weatherLocal: 'Local Forecast',
      weatherAll: 'All Weather',
      webMasking: 'Web Masking',
      settings: 'Settings',
      board: 'Board',
      login: 'Login',
      logout: 'Logout',
      notLoggedIn: 'Not logged in',
    },
  }

  const menuText = menuByLanguage[language]

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isSidebarOpen && <h2>{menuText.menu}</h2>}
        <div
          role="button"
          tabIndex={0}
          className="toggle-button"
          onClick={onToggle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onToggle()
            }
          }}
          aria-label={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
        >
          ≡
        </div>
      </div>

      {isSidebarOpen && (
        <nav className="sidebar-nav">
          <div className="auth-info-box">
            <div className="auth-user-name">{authUser ? authUser.displayName : menuText.notLoggedIn}</div>
            {authUser ? (
              <div
                role="button"
                tabIndex={0}
                className="auth-action"
                onClick={onLogout}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onLogout()
                  }
                }}
              >
                {menuText.logout}
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                className={`auth-action ${activeView === 'login' ? 'active' : ''}`}
                onClick={() => onSelectView('login')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectView('login')
                  }
                }}
              >
                {menuText.login}
              </div>
            )}
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectView('dashboard')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectView('dashboard')
              }
            }}
          >
            {menuText.dashboard}
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
            onClick={() => onSelectView('tasks')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectView('tasks')
              }
            }}
          >
            {menuText.tasks}
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`nav-item ${activeView === 'board' ? 'active' : ''}`}
            onClick={() => onSelectView('board')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectView('board')
              }
            }}
          >
            {menuText.board}
          </div>
          <div className="nav-item-group">
            <div className={`nav-item ${activeView === 'weather' || activeView === 'weatherAll' ? 'active' : ''}`}>
              {menuText.weather}
            </div>
            <div
              role="button"
              tabIndex={0}
              className={`nav-sub-item ${activeView === 'weather' ? 'active' : ''}`}
              onClick={() => onSelectView('weather')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectView('weather')
                }
              }}
            >
              {menuText.weatherLocal}
            </div>
            <div
              role="button"
              tabIndex={0}
              className={`nav-sub-item ${activeView === 'weatherAll' ? 'active' : ''}`}
              onClick={() => onSelectView('weatherAll')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectView('weatherAll')
                }
              }}
            >
              {menuText.weatherAll}
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`nav-item ${activeView === 'webMasking' ? 'active' : ''}`}
            onClick={() => onSelectView('webMasking')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectView('webMasking')
              }
            }}
          >
            {menuText.webMasking}
          </div>
          <div
            role="button"
            tabIndex={0}
            className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => onSelectView('settings')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectView('settings')
              }
            }}
          >
            {menuText.settings}
          </div>
        </nav>
      )}
    </aside>
  )
}

export default Sidebar
