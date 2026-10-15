import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Spider from '../components/Spider'
import { GlitchTitle } from '../components/Brand'
import { IconClip, IconClose, IconPhone, IconPlus, IconSearch, IconStar } from '../components/Icons'
import { useApp } from '../context/AppState'

const emojis = ['🕸️', '✨', '🔥', '💜', '👋']

function Avatar({ letter, tone, size = 'md', online = false }) {
  return (
    <span className={`avatar tone-${tone} size-${size}${online ? ' is-online' : ''}`}>{letter}</span>
  )
}

function matches(person, query) {
  return `${person.name} ${person.handle || ''} ${person.about || ''}`.toLowerCase().includes(query)
}

export default function Chats() {
  const {
    chats,
    sendMessage,
    markChatRead,
    addContact,
    createGroup,
    deleteMessage,
    togglePin,
    toggleMute,
    removeChat,
    activeChatId,
    readReceipts,
    presence,
    directory,
  } = useApp()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [contactsOpen, setContactsOpen] = useState(false)
  const [peopleQuery, setPeopleQuery] = useState('')
  const [groupMode, setGroupMode] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupIds, setGroupIds] = useState([])
  const [toast, setToast] = useState('')
  const [reply, setReply] = useState(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const fileRef = useRef(null)
  const scroller = useRef(null)
  const peopleInput = useRef(null)

  const openId = params.get('open')
  const active = chats.find((chat) => chat.id === (openId || activeChatId)) || chats[0]

  useEffect(() => {
    if (active) markChatRead(active.id)
  }, [active?.id])

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [active?.id, active?.messages.length])

  useEffect(() => {
    if (contactsOpen) peopleInput.current?.focus({ preventScroll: true })
  }, [contactsOpen])

  const q = query.trim().toLowerCase()
  const online = useMemo(() => chats.filter((chat) => chat.kind === 'dm' && chat.online), [chats])
  const filtered = useMemo(() => {
    if (!q) return chats
    return chats.filter((chat) => matches(chat, q))
  }, [chats, q])

  const strangers = useMemo(() => directory.filter((person) => !chats.some((chat) => chat.id === person.id)), [chats])
  const foundPeople = useMemo(() => {
    if (!q) return []
    return strangers.filter((person) => matches(person, q))
  }, [strangers, q])

  const drawerQuery = peopleQuery.trim().toLowerCase()
  const drawerContacts = chats.filter((chat) => chat.kind === 'dm' && (!drawerQuery || matches(chat, drawerQuery)))
  const drawerPeople = strangers.filter((person) => !drawerQuery || matches(person, drawerQuery))

  function selectChat(id) {
    markChatRead(id)
    setInfoOpen(false)
    setReply(null)
    setParams(id === 'vams' ? {} : { open: id })
  }

  function shoot(event) {
    event.preventDefault()
    if (!active || !draft.trim()) return
    sendMessage(active.id, draft, reply)
    setDraft('')
    setReply(null)
    setEmojiOpen(false)
  }

  function showToast(text) {
    setToast(text)
    window.setTimeout(() => setToast(''), 2400)
  }

  function toggleMember(id) {
    setGroupIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function makeGroup() {
    const id = createGroup(groupName, groupIds)
    if (!id) return
    setGroupMode(false)
    setGroupName('')
    setGroupIds([])
    setContactsOpen(false)
    setPeopleQuery('')
    selectChat(id)
  }

  function startWith(person) {
    const id = addContact(person.id)
    setContactsOpen(false)
    setPeopleQuery('')
    setQuery('')
    if (id) selectChat(id)
  }

  function onFile(event) {
    const file = event.target.files?.[0]
    if (!file || !active) return
    sendMessage(active.id, `кинул нить: ${file.name}`)
    event.target.value = ''
  }

  return (
    <div className="chats">
      <section className="chat-list">
        <header className="list-head">
          <GlitchTitle className="page-title">СЕТИ</GlitchTitle>
          <button className="icon-hot" type="button" aria-label="Добавить контакт" onClick={() => setContactsOpen(true)}>
            <IconPlus />
          </button>
        </header>

        <label className="search">
          <IconSearch />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти в паутине" />
        </label>

        <button className="pin-card" type="button" onClick={() => selectChat('anya')}>
          <Spider className="spider-pin" />
          <span>
            <strong>VAMSilk</strong>
            <b>Аня кинула тебе нить!</b>
            <em>«кинь конфиг docker-compose»</em>
          </span>
        </button>

        <p className="section-label">НА НИТКЕ</p>
        <div className="online-row">
          {online.map((chat) => (
            <button key={chat.id} type="button" className="online-person" onClick={() => selectChat(chat.id)}>
              <Avatar letter={chat.letter} tone={chat.tone} online={presence && chat.online} />
              <span>{chat.name}</span>
              <small>{chat.typing ? 'плетёт...' : 'на нити'}</small>
            </button>
          ))}
        </div>

        <div className="thread-list">
          {filtered.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={`thread${active?.id === chat.id ? ' on' : ''}`}
              onClick={() => selectChat(chat.id)}
            >
              <Avatar letter={chat.letter} tone={chat.tone} online={presence && chat.online} />
              <span className="thread-copy">
                <strong>
                  {chat.pinned ? '✦ ' : ''}
                  {chat.name}
                  {chat.muted ? ' · тихо' : ''}
                </strong>
                <em>{chat.typing ? `${chat.typingName || chat.name} плетёт сообщение...` : chat.preview}</em>
              </span>
              <span className="thread-meta">
                <time>{chat.time}</time>
                {chat.badge ? <b className="badge ghost">{chat.badge}</b> : null}
                {chat.unread > 0 ? <b className="badge">{chat.unread}</b> : null}
              </span>
            </button>
          ))}

          {foundPeople.length > 0 ? <p className="section-label">НОВЫЕ ЛЮДИ</p> : null}
          {foundPeople.map((person) => (
            <button key={person.id} type="button" className="thread person-hit" onClick={() => startWith(person)}>
              <Avatar letter={person.letter} tone={person.tone} online={presence && person.online} />
              <span className="thread-copy">
                <strong>{person.name}</strong>
                <em>{person.handle} · ещё не в контактах</em>
              </span>
              <b className="add-pill">Добавить</b>
            </button>
          ))}
          {filtered.length === 0 && foundPeople.length === 0 ? <p className="empty-search">В паутине никого с таким именем</p> : null}
        </div>
      </section>

      <section className="conversation">
        {active ? (
          <>
            <header className="conv-head">
              <button type="button" className="conv-who" onClick={() => setInfoOpen(true)}>
                <Avatar letter={active.letter} tone={active.tone} online={presence && active.online} />
                <span>
                  <strong>{active.name}</strong>
                  <em>
                    {active.kind === 'group' && active.members?.length ? (
                      `${active.members.length} на нити`
                    ) : active.typing ? (
                      <span className="typing">{active.typingName || active.name} плетёт<span /><span /><span /></span>
                    ) : active.online ? (
                      'на нитке'
                    ) : (
                      active.lastSeen || 'давно не было'
                    )}
                  </em>
                </span>
              </button>
              <div className="conv-tools">
                <span>реплика №2 · 6767</span>
                <button className="phone" type="button" aria-label="Позвонить" onClick={() => showToast('Реплика №2 · 6767 не берёт трубку')}>
                  <IconPhone />
                </button>
              </div>
            </header>

            {toast ? <div className="toast">{toast}</div> : null}

            <div className="messages" ref={scroller}>
              <div className="day-chip">Сегодня</div>
              {active.messages.length === 0 ? <p className="empty-chat">Ещё ни одной нити. Выстрели первым.</p> : null}
              {active.messages.map((message) => (
                <article key={message.id} className={`bubble-row${message.mine ? ' mine' : ''}`}>
                  {message.mine ? null : <Avatar letter={message.letter} tone={message.tone} size="sm" />}
                  <div className={`bubble tone-${message.tone || 'hot'}${message.mine ? ' out' : ''}`}>
                    {message.replyTo ? (
                      <small className="quote">
                        {message.replyTo.author}: {message.replyTo.text}
                      </small>
                    ) : null}
                    {message.mine ? null : <b>{message.author}</b>}
                    <p>{message.text}</p>
                    <time>
                      {message.time}
                      {message.meta ? ` · ${message.meta}` : ''}
                      {message.mine && readReceipts ? <i className={`ticks ${message.status || 'read'}`} /> : null}
                    </time>
                    <span className="bubble-actions">
                      <button type="button" onClick={() => setReply(message)}>ответить</button>
                      <button type="button" onClick={() => deleteMessage(active.id, message.id)}>убрать</button>
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="composer-dock">
              {reply ? (
                <div className="reply-bar">
                  <span>Ответ · {reply.author || 'Я'}: {reply.text}</span>
                  <button type="button" aria-label="Отменить ответ" onClick={() => setReply(null)}>
                    <IconClose />
                  </button>
                </div>
              ) : null}
              {emojiOpen ? (
                <div className="emoji-row">
                  {emojis.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => setDraft((value) => `${value}${emoji}`)}>
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
              <form className="composer" onSubmit={shoot}>
                <button className="clip" type="button" aria-label="Прикрепить" onClick={() => fileRef.current?.click()}>
                  <IconClip />
                </button>
                <input ref={fileRef} type="file" hidden onChange={onFile} />
                <button className="clip" type="button" aria-label="Эмодзи" onClick={() => setEmojiOpen((value) => !value)}>
                  ✦
                </button>
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Сплести сообщение..." />
                <button className="btn-hot shoot" type="submit">
                  <IconStar /> Выстрелить
                </button>
              </form>
            </div>
          </>
        ) : (
          <p className="empty-chat">Выбери нить или найди нового человека.</p>
        )}
      </section>

      {infoOpen && active ? (
        <aside className="info-card">
          <button className="info-close" type="button" aria-label="Закрыть" onClick={() => setInfoOpen(false)}>
            <IconClose />
          </button>
          <Avatar letter={active.letter} tone={active.tone} online={presence && active.online} />
          <h2>{active.name}</h2>
          <p className="handle">{active.handle || `@${active.id}`}</p>
          <p className="status-line">{active.online ? 'на нитке · реплика живая' : active.lastSeen || 'нити нет в эфире'}</p>
          <p className="about">{active.about || 'Нить в паутине VAMSilk.'}</p>
          <div className="info-actions">
            <button type="button" className="btn-ghost" onClick={() => togglePin(active.id)}>
              {active.pinned ? 'Открепить' : 'Закрепить'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => toggleMute(active.id)}>
              {active.muted ? 'Включить сигналы' : 'Без сигналов'}
            </button>
            {active.id !== 'vams' ? (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  removeChat(active.id)
                  setInfoOpen(false)
                  selectChat('vams')
                }}
              >
                Удалить чат
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}

      {contactsOpen ? (
        <div className="drawer-back" onClick={() => setContactsOpen(false)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <header className="drawer-head">
              <div>
                <GlitchTitle className="page-title">КОНТАКТЫ</GlitchTitle>
                <p>Свои нити и люди, которых можно добавить.</p>
              </div>
              <button type="button" className="clip" aria-label="Закрыть" onClick={() => setContactsOpen(false)}>
                <IconClose />
              </button>
            </header>
            <label className="search">
              <IconSearch />
              <input
                ref={peopleInput}
                value={peopleQuery}
                onChange={(event) => setPeopleQuery(event.target.value)}
                placeholder="Найти человека"
              />
            </label>

            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setGroupMode((value) => !value)
                setGroupIds([])
              }}
            >
              {groupMode ? 'Отмена' : 'Сплести группу'}
            </button>
            {groupMode ? (
              <div className="group-build">
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Название группы"
                />
                <button className="btn-hot group-go" type="button" disabled={groupIds.length < 2} onClick={makeGroup}>
                  Создать из {groupIds.length}
                </button>
              </div>
            ) : null}

            <div className="drawer-scroll">
            <p className="section-label">УЖЕ НА НИТИ</p>
            <div className="person-list">
              {drawerContacts.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={`person-row${groupMode && groupIds.includes(chat.id) ? ' on' : ''}`}
                  onClick={() => (groupMode ? toggleMember(chat.id) : (setContactsOpen(false), selectChat(chat.id)))}
                >
                  <Avatar letter={chat.letter} tone={chat.tone} online={presence && chat.online} />
                  <span className="person-copy">
                    <strong>{chat.name}</strong>
                    <em>{chat.handle || `@${chat.id}`} · {chat.online ? 'на нити' : chat.lastSeen || 'тихо'}</em>
                  </span>
                  <b className="add-pill ghost">{groupMode ? (groupIds.includes(chat.id) ? 'В группе' : 'Выбрать') : 'Написать'}</b>
                </button>
              ))}
            </div>

            <p className="section-label">НАЙТИ ЛЮДЕЙ</p>
            <div className="person-list">
              {drawerPeople.length === 0 ? <p className="empty-search">Новых нитей с таким именем нет</p> : null}
              {drawerPeople.map((person) => (
                <button key={person.id} type="button" className="person-row" onClick={() => startWith(person)}>
                  <Avatar letter={person.letter} tone={person.tone} online={presence && person.online} />
                  <span className="person-copy">
                    <strong>{person.name}</strong>
                    <em>{person.handle} · {person.about}</em>
                  </span>
                  <b className="add-pill">Добавить</b>
                </button>
              ))}
            </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
