import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlitchTitle } from '../components/Brand'
import { IconSearch } from '../components/Icons'
import { directory } from '../data'
import { useApp } from '../context/AppState'

const spots = {
  top: { x: 240, y: 96 },
  tr: { x: 356, y: 164 },
  br: { x: 356, y: 292 },
  bottom: { x: 240, y: 356 },
  bl: { x: 124, y: 292 },
  left: { x: 124, y: 164 },
}

const center = { x: 240, y: 226 }

function paint() {
  const style = getComputedStyle(document.documentElement)
  const pick = (name) => style.getPropertyValue(name).trim()
  return { hot: pick('--hot'), cool: pick('--cool'), ink: pick('--ink'), soft: pick('--web-line') }
}

function bendOf(freq) {
  if (freq === 'constant') return 36
  if (freq === 'often') return 18
  return 0
}

function threadPath(node, amp = 0) {
  const mx = (center.x + node.x) / 2
  const my = (center.y + node.y) / 2
  const px = node.y - center.y
  const py = center.x - node.x
  const len = Math.hypot(px, py) || 1
  const bend = bendOf(node.freq)
  const cx = mx + (px / len) * amp + (node.x > center.x ? bend : -bend) * 0.2
  const cy = my + (py / len) * amp + bend
  return `M ${center.x} ${center.y} Q ${cx} ${cy} ${node.x} ${node.y}`
}

function darker(hex) {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return hex
  const channel = (index) => Math.max(0, Math.round(parseInt(raw.slice(index, index + 2), 16) * 0.62))
  return `#${[0, 2, 4].map((index) => channel(index).toString(16).padStart(2, '0')).join('')}`
}

function spiderMarkup(x, y, deg, wave, colors) {
  const leg = darker(colors.hot)
  const legs = []
  for (let i = 0; i < 4; i += 1) {
    const yy = -4 + i * 4.6
    const wag = Math.sin(wave + i * 1.7) * 2.2
    legs.push(
      `<path d="M-5 ${yy} Q${-12 + wag} ${yy - 7} ${-16 + wag} ${yy + 1} M5 ${yy} Q${12 - wag} ${yy - 7} ${16 - wag} ${yy + 1}" fill="none" stroke="${leg}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<circle cx="${-16 + wag}" cy="${yy + 1}" r="1.35" fill="${colors.cool}"/>`,
      `<circle cx="${16 - wag}" cy="${yy + 1}" r="1.35" fill="${colors.cool}"/>`,
    )
  }
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(1.05)">${legs.join('')}
    <ellipse cx="0" cy="7" rx="7.2" ry="8" fill="${colors.hot}"/>
    <path d="M0 11 C-4.6 7.6 -3.4 4 0 5.8 C3.4 4 4.6 7.6 0 11Z" fill="${colors.cool}"/>
    <circle cx="0" cy="-5" r="6" fill="${colors.hot}"/>
    <circle cx="-2.35" cy="-5.5" r="2.05" fill="#fff"/><circle cx="2.35" cy="-5.5" r="2.05" fill="#fff"/>
    <circle cx="-2.15" cy="-5.35" r="0.95" fill="#241018"/><circle cx="2.15" cy="-5.35" r="0.95" fill="#241018"/>
  </g>`
}

export default function Web() {
  const navigate = useNavigate()
  const { theme, chats } = useApp()
  const contacts = chats.filter((chat) => chat.kind === 'dm')
  const [selectedId, setSelectedId] = useState('anya')
  const [query, setQuery] = useState('')
  const [hoverId, setHoverId] = useState(null)
  const [fx, setFx] = useState('')
  const [wobble, setWobble] = useState(null)
  const frame = useRef(0)
  const selected =
    directory.find((person) => person.id === selectedId) ||
    contacts.find((chat) => chat.id === selectedId) ||
    contacts[0]

  const nodes = useMemo(
    () =>
      contacts.map((chat, index) => {
        const meta = directory.find((person) => person.id === chat.id) || chat
        const spot = spots[meta.spot] || {
          x: 240 + Math.cos((index / Math.max(contacts.length, 1)) * Math.PI * 2 - Math.PI / 2) * 148,
          y: 226 + Math.sin((index / Math.max(contacts.length, 1)) * Math.PI * 2 - Math.PI / 2) * 136,
        }
        return { ...meta, ...chat, ...spot, freq: meta.freq || 'rare' }
      }),
    [contacts],
  )
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const needle = query.trim().toLowerCase()
  const shown = needle
    ? nodes.filter((node) => `${node.name} ${node.handle || ''}`.toLowerCase().includes(needle))
    : nodes

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function crawl(id) {
    const node = nodesRef.current.find((item) => item.id === id)
    if (!node) return
    cancelAnimationFrame(frame.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFx('')
      setWobble(null)
      return
    }
    const colors = paint()
    const started = performance.now()
    const dur = 900
    const bend = bendOf(node.freq)
    const ctrlX = (center.x + node.x) / 2 + (node.x > center.x ? bend : -bend) * 0.2
    const ctrlY = (center.y + node.y) / 2 + bend
    const tangent = (u) => {
      const left = 1 - u
      return {
        x: 2 * left * (ctrlX - center.x) + 2 * u * (node.x - ctrlX),
        y: 2 * left * (ctrlY - center.y) + 2 * u * (node.y - ctrlY),
      }
    }
    const step = (now) => {
      const t = now - started
      const travel = Math.min(1, t / dur)
      const eased = travel < 0.5 ? 2 * travel * travel : 1 - ((-2 * travel + 2) ** 2) / 2
      const left = 1 - eased
      const x = left * left * center.x + 2 * left * eased * ctrlX + eased * eased * node.x
      const y = left * left * center.y + 2 * left * eased * ctrlY + eased * eased * node.y
      const aim = tangent(eased)
      const deg = (Math.atan2(aim.y, aim.x) * 180) / Math.PI + 90
      const alive = t < dur ? 1 : Math.max(0, 1 - (t - dur) / 700)
      let html = ''
      const trailX = left * center.x + eased * ctrlX
      const trailY = left * center.y + eased * ctrlY
      html += `<path d="M ${center.x} ${center.y} Q ${trailX.toFixed(1)} ${trailY.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${colors.cool}" stroke-width="8" stroke-linecap="round" opacity="${(0.4 * alive).toFixed(2)}"/>`
      html += `<path d="M ${center.x} ${center.y} Q ${trailX.toFixed(1)} ${trailY.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${colors.hot}" stroke-width="2.5" stroke-linecap="round" opacity="${(0.9 * alive).toFixed(2)}"/>`
      if (t < dur + 450) html += spiderMarkup(x, y, deg, t / 55, colors)
      if (t >= dur && t < dur + 700) {
        const q = (t - dur) / 700
        const radius = 26 + q * 48
        html += `<circle cx="${node.x}" cy="${node.y}" r="${radius.toFixed(1)}" fill="none" stroke="${colors.soft}" stroke-width="${(3.2 * (1 - q) + 0.6).toFixed(1)}" opacity="${(1 - q).toFixed(2)}"/>`
        for (let k = 0; k < 8; k += 1) {
          const angle = k * (Math.PI / 4) + 0.4
          const dist = 30 + q * 58
          html += `<circle cx="${(node.x + Math.cos(angle) * dist).toFixed(1)}" cy="${(node.y + Math.sin(angle) * dist).toFixed(1)}" r="${(4.2 * (1 - q) + 0.6).toFixed(1)}" fill="${k % 2 ? colors.hot : colors.cool}" opacity="${(1 - q).toFixed(2)}"/>`
        }
        const tw = (t - dur) / 1000
        const amp = 34 * Math.exp(-4 * tw) * Math.sin(tw * 40)
        setWobble({ id: node.id, d: threadPath(node, amp) })
      }
      setFx(html)
      if (t < dur + 1300) frame.current = requestAnimationFrame(step)
      else {
        setFx('')
        setWobble(null)
      }
    }
    frame.current = requestAnimationFrame(step)
  }

  function pick(id) {
    setSelectedId(id)
    crawl(id)
  }

  return (
    <div className="web-page">
      <header className="web-head">
        <div>
          <GlitchTitle className="page-title">ПАУТИНА</GlitchTitle>
          <p>Чем толще нить, тем чаще вы общаетесь. Нажми на человека — паучок доползёт по нити.</p>
        </div>
        <ul className="legend">
          <li><i className="leg rare" /> редко</li>
          <li><i className="leg often" /> часто</li>
          <li><i className="leg constant" /> постоянно</li>
        </ul>
      </header>

      <div className="web-layout">
        <aside className="contacts-pane panel">
          <p className="section-label">КОНТАКТЫ</p>
          <label className="search">
            <IconSearch />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти человека"
            />
          </label>
          <div className="contacts-pane-list">
            {shown.length === 0 ? <p className="empty-search">Такой нити нет</p> : null}
            {shown.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`person-row${selectedId === node.id ? ' on' : ''}`}
                onClick={() => pick(node.id)}
              >
                <span className={`avatar size-sm tone-${node.tone || 'hot'}`}>{node.letter}</span>
                <span className="person-copy">
                  <strong>{node.name}</strong>
                  <em>{node.online ? 'в сети' : 'тихо'}</em>
                </span>
              </button>
            ))}
          </div>
        </aside>
        <svg className={`web-svg${hoverId ? ' is-hot' : ''}`} viewBox="-28 -8 536 520">
          <g className="hexes" fill="none" stroke="currentColor" strokeWidth="1.4">
            <polygon points="240,70 378,150 378,310 240,390 102,310 102,150" />
            <polygon points="240,118 332,172 332,286 240,340 148,286 148,172" />
            <polygon points="240,164 286,194 286,254 240,284 194,254 194,194" />
          </g>
          <circle className="web-pulse" cx={center.x} cy={center.y} r="42" />
          <circle className="web-pulse late" cx={center.x} cy={center.y} r="42" />
          {nodes.map((node) => (
            <path
              key={`${node.id}-line`}
              d={wobble?.id === node.id ? wobble.d : threadPath(node)}
              className={`thread-line ${node.freq}${hoverId === node.id ? ' hot' : ''}`}
            />
          ))}
          <g className="web-me-wrap">
            <circle cx={center.x} cy={center.y} r="42" className="web-me" />
            <text x={center.x} y={center.y} textAnchor="middle" dominantBaseline="central" className="web-me-label">
              ТЫ
            </text>
          </g>
          {nodes.map((node, index) => (
            <g
              key={node.id}
              className={`web-node${selectedId === node.id ? ' on' : ''}`}
              style={{ animationDelay: `${index * 0.32}s` }}
              role="button"
              tabIndex={0}
              onClick={() => pick(node.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  pick(node.id)
                }
              }}
              onMouseEnter={() => setHoverId(node.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(node.id)}
              onBlur={() => setHoverId(null)}
            >
              <g className="node-disc">
                <rect x={node.x - 26} y={node.y - 26} width="52" height="52" rx="16" className={`node-face tone-${node.tone || 'hot'}`} />
                <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" className="node-letter">
                  {node.letter || (node.name || '?').slice(0, 1)}
                </text>
              </g>
            </g>
          ))}
          <g className="web-fx" dangerouslySetInnerHTML={{ __html: fx }} />
        </svg>

        <aside className="thread-card" data-theme-preview={theme}>
          <div className="thread-card-who">
            <span className={`avatar tone-${selected.tone}`}>{selected.letter}</span>
            <span>
              <strong>{selected.name}</strong>
              <em>
                {selected.typing ? 'плетёт сообщение...' : selected.online ? 'в сети' : 'нити нет в эфире'}
              </em>
            </span>
          </div>
          <div className="stat-row">
            <div>
              <b>{selected.threads}</b>
              <span>нитей всего</span>
            </div>
            <div>
              <b>{selected.streak}</b>
              <span>дней подряд на нитке</span>
            </div>
          </div>
          <p>{selected.about}</p>
          <button className="btn-hot btn-wide" type="button" onClick={() => navigate(`/app/chats?open=${selected.id}`)}>
            Кинуть нить
          </button>
        </aside>
      </div>
    </div>
  )
}
