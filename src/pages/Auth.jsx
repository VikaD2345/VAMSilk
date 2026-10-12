import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Radar from '../components/Radar'
import Spider from '../components/Spider'
import { useApp } from '../context/AppState'
import { paintTheme } from '../themeWipe'

export default function Auth() {
  const { user, theme, setTheme, login, register } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [nick, setNick] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  if (user) return <Navigate to="/app/chats" replace />

  function fail(message) {
    setError(message)
    setShake(true)
    window.setTimeout(() => setShake(false), 420)
  }

  function onSubmit(event) {
    event.preventDefault()
    const result = mode === 'login' ? login(nick, password) : register({ nick, name, password })
    if (!result.ok) {
      fail(result.error)
      return
    }
    navigate('/app/chats', { replace: true })
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
    setNick('')
    if (next === 'register') setName('')
  }

  return (
    <div className="gate">
      <Radar />
      <div className="gate-top">
        <Brand />
        <div className="gate-theme" role="group" aria-label="Тема">
          <button type="button" className={theme === 'light' ? 'on' : ''} onClick={(event) => { if (theme !== 'light') paintTheme('light', event, setTheme) }}>
            Светлая
          </button>
          <button type="button" className={theme === 'dark' ? 'on' : ''} onClick={(event) => { if (theme !== 'dark') paintTheme('dark', event, setTheme) }}>
            Тёмная
          </button>
        </div>
      </div>
      <div className="auth-stack">
        <div className="gate-swing">
          <span className="gate-silk" />
          <Spider className="spider-peek" />
        </div>
        <form className={`auth-card${shake ? ' shake' : ''}`} onSubmit={onSubmit}>
          <div className="tabs" role="tablist">
            <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>
              Вход
            </button>
            <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => switchMode('register')}>
              Регистрация
            </button>
          </div>

          <h1>{mode === 'login' ? 'Зацепиться за паутину' : 'Сплести аккаунт'}</h1>
          <p className="auth-sub">{mode === 'login' ? 'Нить не пускает чужих' : 'Новая нить в паутине VAMSilk'}</p>

          <label>
            Ник
            <input value={nick} onChange={(event) => setNick(event.target.value)} placeholder="Ты" autoComplete="username" />
          </label>

          {mode === 'register' ? (
            <label>
              Имя на нити
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Я" autoComplete="nickname" />
            </label>
          ) : null}

          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="btn-hot btn-wide" type="submit">
            {mode === 'login' ? 'Зацепиться' : 'Сплести'}
          </button>
          <p className="auth-note">Реплика №67 запоминает, кто на нити</p>
          <button type="button" className="text-link" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Нет нити? Сплести аккаунт' : 'Уже на нити? Зацепиться'}
          </button>
          {mode === 'login' ? <p className="demo-note">Демо-нить: Ты · пароль 67</p> : null}
        </form>
      </div>
    </div>
  )
}
