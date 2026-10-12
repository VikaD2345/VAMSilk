import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Brand, { GlitchTitle } from '../components/Brand'
import Radar from '../components/Radar'
import Spider from '../components/Spider'
import { splashStatuses, splashTips } from '../data'
import { useApp } from '../context/AppState'

export default function Splash() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const started = Date.now()
    const duration = 2600
    const timer = window.setInterval(() => {
      const value = Math.min(100, Math.round(((Date.now() - started) / duration) * 100))
      setProgress(value)
      if (value >= 100) {
        window.clearInterval(timer)
        navigate(user ? '/app/chats' : '/login', { replace: true })
      }
    }, 40)
    return () => window.clearInterval(timer)
  }, [navigate, user])

  const status = splashStatuses[Math.min(splashStatuses.length - 1, Math.floor(progress / 34))]
  const tip = splashTips[Math.min(splashTips.length - 1, Math.floor(progress / 40))]

  return (
    <div className="gate">
      <Radar />
      <Brand />
      <div className="splash-center">
        <GlitchTitle className="splash-title">VAMSilk</GlitchTitle>
        <p className="splash-lead">Плетём паутину для твоих чатов</p>
        <Spider className="spider-hero" />
        <div className="progress">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-meta">
          <span>{status}</span>
          <strong>{progress}%</strong>
        </div>
        <p className="splash-tip">{tip}</p>
      </div>
    </div>
  )
}
