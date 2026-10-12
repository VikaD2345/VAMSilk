import { useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Radar from '../components/Radar'
import Spider from '../components/Spider'
import { useApp } from '../context/AppState'

export default function ErrorPage() {
  const navigate = useNavigate()
  const { user } = useApp()

  return (
    <div className="gate error-page">
      <Radar />
      <Brand />
      <div className="error-center">
        <div className="giant-row">
          <span className="giant cool">6</span>
          <Spider className="spider-error" />
          <span className="giant hot">7</span>
        </div>
        <section className="error-card">
          <h1>Ошибка 6...7</h1>
          <p>
            Нить порвалась где-то между шестью и семью. Вамсик взвешивает, кто виноват.
          </p>
          <div className="error-actions">
            <button className="btn-hot" type="button" onClick={() => navigate(user ? '/app/chats' : '/login')}>
              Вернуться в Сети
            </button>
            <button className="btn-ghost" type="button" onClick={() => navigate('/')}>
              Переплести нить
            </button>
          </div>
        </section>
        <p className="error-foot">503 · haproxy · 6767 · реплика №67 не отвечает · все остальные тоже</p>
      </div>
    </div>
  )
}
