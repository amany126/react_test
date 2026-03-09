import { useState } from 'react'

function LoginView({ language, authUser, onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const textByLanguage = {
    ko: {
      title: '로그인',
      description: '게시글 작성과 댓글/대댓글 작성은 로그인 후 이용할 수 있습니다.',
      username: '아이디',
      password: '비밀번호',
      submit: '로그인',
      loggedInAs: '현재 로그인 사용자',
      defaultHint: '테스트 계정: admin/1234 또는 user/1234',
    },
    en: {
      title: 'Login',
      description: 'Login is required to write posts and comments/replies.',
      username: 'Username',
      password: 'Password',
      submit: 'Login',
      loggedInAs: 'Current user',
      defaultHint: 'Test account: admin/1234 or user/1234',
    },
  }

  const text = textByLanguage[language]

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Login failed')
      }

      onLoginSuccess({
        token: data.token,
        user: data.user,
      })

      setUsername('')
      setPassword('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-view">
      <h1>{text.title}</h1>
      <p className="view-description">{text.description}</p>

      {authUser && (
        <div className="login-current-user">
          <strong>{text.loggedInAs}:</strong> {authUser.displayName}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-field" htmlFor="login-username">
          <span>{text.username}</span>
          <input
            id="login-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="login-field" htmlFor="login-password">
          <span>{text.password}</span>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {errorMessage && <p className="login-error">{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {text.submit}
        </button>

        <p className="login-hint">{text.defaultHint}</p>
      </form>
    </section>
  )
}

export default LoginView
