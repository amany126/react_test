import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import './App.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [language, setLanguage] = useState('ko')
  const [theme, setTheme] = useState('light')
  const [status, setStatus] = useState('checking')
  const [response, setResponse] = useState(null)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') ?? '')
  const [authUser, setAuthUser] = useState(null)

  const textByLanguage = {
    ko: {
      title: '메인 영역',
      dashboard: '대시보드 화면입니다.',
      tasks: '작업 목록 화면입니다.',
      weather: '기상예보',
      weatherAll: '전체날씨',
      webMasking: '웹 마스킹',
      settings: '설정',
      board: '게시판',
      login: '로그인',
    },
    en: {
      title: 'Main Area',
      dashboard: 'This is the dashboard view.',
      tasks: 'This is the task list view.',
      weather: 'Weather Forecast',
      weatherAll: 'All Weather',
      webMasking: 'Web Masking',
      settings: 'Settings',
      board: 'Board',
      login: 'Login',
    },
  }

  const text = textByLanguage[language]

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const result = await fetch('/api/health')

        if (!result.ok) {
          throw new Error(`HTTP ${result.status}`)
        }

        const data = await result.json()
        setResponse(data)
        setStatus('connected')
      } catch {
        setStatus('failed')
      }
    }

    checkBackend()
  }, [])

  useEffect(() => {
    const fetchMe = async () => {
      if (!authToken) {
        setAuthUser(null)
        return
      }

      try {
        const result = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!result.ok) {
          throw new Error('Unauthorized')
        }

        const data = await result.json()
        setAuthUser(data.user)
      } catch {
        setAuthToken('')
        setAuthUser(null)
        localStorage.removeItem('authToken')
      }
    }

    fetchMe()
  }, [authToken])

  const handleLoginSuccess = ({ token, user }) => {
    setAuthToken(token)
    setAuthUser(user)
    localStorage.setItem('authToken', token)
    setActiveView('board')
  }

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      }
    } catch {
      // no-op
    } finally {
      setAuthToken('')
      setAuthUser(null)
      localStorage.removeItem('authToken')
      setActiveView('login')
    }
  }

  return (
    <div className={`layout theme-${theme}`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeView={activeView}
        onSelectView={setActiveView}
        language={language}
        authUser={authUser}
        onLogout={handleLogout}
      />
      <MainContent
        activeView={activeView}
        status={status}
        response={response}
        language={language}
        theme={theme}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        text={text}
        authUser={authUser}
        authToken={authToken}
        onLoginSuccess={handleLoginSuccess}
        onRequireLogin={() => setActiveView('login')}
      />
    </div>
  )
}

export default App

