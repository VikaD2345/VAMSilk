import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlitchTitle } from '../components/Brand'
import { useApp } from '../context/AppState'
import { paintTheme } from '../themeWipe'

function Row({ title, text, on, onClick }) {
  return (
    <div className="setting-row">
      <div className="setting-copy">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <button type="button" className={`switch${on ? ' on' : ''}`} aria-pressed={on} onClick={onClick}>
        <i />
      </button>
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme, notificationsOn, setNotificationsOn, readReceipts, setReadReceipts, presence, setPresence, logout } = useApp()
  const navigate = useNavigate()
  const [bye, setBye] = useState(false)

  function leave() {
    if (bye) return
    setBye(true)
    window.setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, 700)
  }

  return (
    <div className="settings-page">
      <header className="page-head">
        <GlitchTitle className="page-title">НАСТРОЙКИ</GlitchTitle>
        <p>Тема, сигналы и то, как ведёт себя паутина.</p>
      </header>

      <div className="settings-stack">
        <section className="panel settings-card">
          <p className="section-label">ТЕМА</p>
          <div className="theme-pick settings-themes">
            <button type="button" className={theme === 'dark' ? 'on' : ''} onClick={(event) => { if (theme !== 'dark') paintTheme('dark', event, setTheme) }}>
              <span className="swatch dark" />
              Тёмная
            </button>
            <button type="button" className={theme === 'light' ? 'on' : ''} onClick={(event) => { if (theme !== 'light') paintTheme('light', event, setTheme) }}>
              <span className="swatch light" />
              Светлая
            </button>
          </div>
        </section>

        <section className="panel settings-card">
          <Row
            title="Уведомления о нитях"
            text="Сигнал, когда пишут в чат"
            on={notificationsOn}
            onClick={() => setNotificationsOn((value) => !value)}
          />
          <Row
            title="Галочки прочтения"
            text="Показывать, дошло ли сообщение"
            on={readReceipts}
            onClick={() => setReadReceipts((value) => !value)}
          />
          <Row
            title="Статус «на нитке»"
            text="Зелёная точка у тех, кто в сети"
            on={presence}
            onClick={() => setPresence((value) => !value)}
          />
          <button className={`btn-outline settings-leave${bye ? ' shake' : ''}`} type="button" onClick={leave}>
            {bye ? 'Нить оборвана…' : 'Выйти из паутины'}
          </button>
        </section>
      </div>
    </div>
  )
}
