import { useEffect } from 'react'
import { GlitchTitle } from '../components/Brand'
import { useApp } from '../context/AppState'

export default function Signals() {
  const { signals, markSignalsRead, notificationsOn } = useApp()

  useEffect(() => {
    markSignalsRead()
  }, [])

  return (
    <div className="signals-page">
      <header className="page-head">
        <GlitchTitle className="page-title">СИГНАЛЫ</GlitchTitle>
        <p>{notificationsOn ? 'Паутина шепчет, когда на нити новое.' : 'Сигналы приглушены в профиле.'}</p>
      </header>
      <div className="signal-list">
        {signals.length === 0 ? <p className="empty-chat">Пока ни одного сигнала.</p> : null}
        {signals.map((item) => (
          <article key={item.id} className={`signal${item.unread ? ' fresh' : ''}`}>
            <span className="avatar tone-hot">V</span>
            <span>
              <strong>{item.title}</strong>
              <em>{item.text}</em>
            </span>
            <time>{item.time}</time>
          </article>
        ))}
      </div>
    </div>
  )
}
