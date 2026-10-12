import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Spider from '../components/Spider'
import { GlitchTitle } from '../components/Brand'
import { useApp } from '../context/AppState'
import { paintTheme } from '../themeWipe'

const calmMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useCount(target) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (calmMotion()) {
      setValue(target)
      return undefined
    }
    const started = performance.now()
    let frame = 0
    const step = (now) => {
      const progress = Math.min(1, (now - started) / 900)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value
}

function Stat({ value, label }) {
  const shown = useCount(Number(value) || 0)
  const [bump, setBump] = useState(false)
  return (
    <button
      type="button"
      className={`stat-hit${bump ? ' bump' : ''}`}
      onClick={() => {
        setBump(false)
        requestAnimationFrame(() => setBump(true))
      }}
      onAnimationEnd={() => setBump(false)}
    >
      <b>{shown}</b>
      <span>{label}</span>
    </button>
  )
}

function ThreadPluck({ live, twangRef }) {
  const [curve, setCurve] = useState(48)
  const [along, setAlong] = useState(null)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function twang() {
    cancelAnimationFrame(frame.current)
    if (calmMotion()) return
    const started = performance.now()
    const base = live ? 48 : 90
    const step = (now) => {
      const t = (now - started) / 1000
      const amp = 28 * Math.exp(-3.4 * t) * Math.sin(t * 36)
      setCurve(base + amp)
      if (t < 1.2) frame.current = requestAnimationFrame(step)
      else setCurve(base)
    }
    frame.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    twangRef.current = twang
    setCurve(live ? 48 : 90)
  }, [live])

  useEffect(() => {
    if (!live || calmMotion()) {
      setAlong(null)
      return undefined
    }
    let raf = 0
    let runStart = 0
    let next = performance.now() + 900
    const step = (now) => {
      if (!runStart && now >= next) runStart = now
      if (runStart) {
        const progress = (now - runStart) / 1400
        if (progress >= 1) {
          runStart = 0
          next = now + 2600
          setAlong(null)
          twangRef.current?.()
        } else {
          const eased = progress * progress * (3 - 2 * progress)
          setAlong(eased)
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [live])

  return (
    <div className="thread-pluck">
      <Link to="/app/signals">Сигналы о нитях</Link>
      <button type="button" onClick={twang} aria-label="Дёрнуть нить">
        <svg viewBox="0 0 320 120" aria-hidden="true">
          <path className={live ? '' : 'off'} d={`M 22 40 Q 160 ${curve.toFixed(1)} 298 40`} />
          <circle className="end" cx="22" cy="40" r="8" />
          <circle className="end" cx="298" cy="40" r="8" />
          {along == null ? null : (
            <circle
              className="signal-dot"
              cx={22 + 276 * along}
              cy={40 + (curve - 40) * 2 * along * (1 - along)}
              r="6"
            />
          )}
        </svg>
      </button>
      <p>{live ? 'Пока тишина. Сигнал прилетит, когда кто-то напишет.' : 'Сигналы выключены. Нить провисла.'}</p>
    </div>
  )
}

export default function Profile() {
  const { user, theme, setTheme, notificationsOn, setNotificationsOn, updateProfile, logout } = useApp()
  const navigate = useNavigate()
  const letter = (user?.name || 'Я').slice(0, 1).toUpperCase()
  const [wobble, setWobble] = useState(false)
  const [down, setDown] = useState(false)
  const [bye, setBye] = useState(false)
  const dropTimer = useRef(0)
  const twangRef = useRef(() => {})

  useEffect(() => () => window.clearTimeout(dropTimer.current), [])

  function dropSpider() {
    if (down) return
    setDown(true)
    window.clearTimeout(dropTimer.current)
    dropTimer.current = window.setTimeout(() => setDown(false), 1600)
  }

  function leave() {
    setBye(true)
    dropSpider()
    twangRef.current?.()
    window.setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, 700)
  }

  return (
    <div className="profile-page">
      <header className="page-head">
        <GlitchTitle className="page-title">ПРОФИЛЬ</GlitchTitle>
        <p>Твоя нить в паутине VAMSilk</p>
      </header>

      <div className="profile-grid">
        <section className="panel profile-main">
          <div className="profile-top">
            <button
              type="button"
              className={`me-tile${wobble ? ' wob' : ''}`}
              aria-label="Аватар"
              onClick={() => {
                setWobble(false)
                requestAnimationFrame(() => setWobble(true))
              }}
              onAnimationEnd={() => setWobble(false)}
            >
              {letter}
            </button>
            <button type="button" className={`spider-hit${down ? ' dropped' : ''}`} onClick={dropSpider} aria-label="Паучок на нити">
              <span className="spider-hang">
                <span className="spider-silk" />
                <Spider className="spider-profile" />
              </span>
            </button>
          </div>
          <h2>{user?.name || 'Я'}</h2>
          <p className="handle">{user?.handle || '@na_nitke'}</p>
          <p className="status-line">
            <i /> на нитке · реплика живая
          </p>
          <div className="stat-row three">
            <Stat value={user?.threads ?? 128} label="нитей" />
            <Stat value={user?.days ?? 42} label="дня на нитке" />
            <Stat value={user?.replica ?? 67} label="реплика" />
          </div>
          <label className="bio-label">
            О себе
            <textarea
              value={user?.bio || ''}
              onChange={(event) => updateProfile({ bio: event.target.value })}
              rows={4}
            />
          </label>
        </section>

        <section className="panel profile-settings settings-card">
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

          <div className="notify-row setting-row">
            <span>
              <strong>Уведомления о нитях</strong>
              <em>Кидать сигнал, когда пишут</em>
            </span>
            <button
              type="button"
              className={`switch${notificationsOn ? ' on' : ''}`}
              aria-pressed={notificationsOn}
              onClick={() => setNotificationsOn((value) => !value)}
            >
              <i />
            </button>
          </div>

          <ThreadPluck live={notificationsOn} twangRef={twangRef} />
          <button className={`btn-outline settings-leave${bye ? ' shake' : ''}`} type="button" onClick={leave}>
            {bye ? 'Нить оборвана…' : 'Выйти из паутины'}
          </button>
        </section>
      </div>
    </div>
  )
}
