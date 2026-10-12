import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEMO_USER, createInitialChats, directory, initialSignals, nowLabel } from '../data'

const AppStateContext = createContext(null)

const THEME_KEY = 'vamsilk-theme'
const SESSION_KEY = 'vamsilk-session'
const USERS_KEY = 'vamsilk-users'
const CHATS_KEY = 'vamsilk-chats-v3'
const PREFS_KEY = 'vamsilk-prefs'
const SIGNALS_KEY = 'vamsilk-signals'
const NOTIFY_KEY = 'vamsilk-notify'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function bumpChat(list, chatId, patch) {
  const next = list.map((chat) => (chat.id === chatId ? { ...chat, ...patch } : chat))
  const group = next.find((chat) => chat.id === 'vams')
  const rest = next.filter((chat) => chat.id !== 'vams')
  const index = rest.findIndex((chat) => chat.id === chatId)
  if (index > 0 && !rest[index].pinned) {
    const [item] = rest.splice(index, 1)
    const pinCount = rest.filter((chat) => chat.pinned).length
    rest.splice(pinCount, 0, item)
  }
  const pinned = rest.filter((chat) => chat.pinned)
  const loose = rest.filter((chat) => !chat.pinned)
  return group ? [group, ...pinned, ...loose] : [...pinned, ...loose]
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [users, setUsers] = useState(() => readJson(USERS_KEY, [DEMO_USER]))
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null))
  const [chats, setChats] = useState(() => readJson(CHATS_KEY, createInitialChats()))
  const [signals, setSignals] = useState(() => readJson(SIGNALS_KEY, initialSignals))
  const [notificationsOn, setNotificationsOn] = useState(() => readJson(NOTIFY_KEY, true))
  const [readReceipts, setReadReceipts] = useState(() => readJson(PREFS_KEY, { readReceipts: true }).readReceipts)
  const [presence, setPresence] = useState(() => readJson(PREFS_KEY, { presence: true }).presence !== false)
  const [activeChatId, setActiveChatId] = useState('vams')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  useEffect(() => {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals))
  }, [signals])

  useEffect(() => {
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(notificationsOn))
  }, [notificationsOn])

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ readReceipts, presence }))
  }, [readReceipts, presence])

  const api = useMemo(() => {
    function login(nick, password) {
      const found = users.find((item) => item.nick.trim().toLowerCase() === nick.trim().toLowerCase())
      if (!found) return { ok: false, error: 'Такой нити нет. Сплети аккаунт.' }
      if (found.password !== password) return { ok: false, error: 'Нить не пускает чужих.' }
      setUser(found)
      return { ok: true }
    }

    function register({ nick, name, password }) {
      const cleanNick = nick.trim()
      const cleanName = name.trim()
      if (cleanNick.length < 2 || cleanName.length < 1 || password.length < 2) {
        return { ok: false, error: 'Нить слишком тонкая. Заполни все поля.' }
      }
      if (users.some((item) => item.nick.toLowerCase() === cleanNick.toLowerCase())) {
        return { ok: false, error: 'Эта нить уже занята.' }
      }
      const next = {
        nick: cleanNick,
        password,
        name: cleanName,
        handle: `@${cleanNick.toLowerCase()}`,
        bio: 'Новая нить в паутине VAMSilk. Реплика №67 ещё тёплая.',
        threads: 1,
        days: 1,
        replica: 67,
      }
      setUsers((prev) => [...prev, next])
      setUser(next)
      return { ok: true }
    }

    function logout() {
      setUser(null)
    }

    function updateProfile(patch) {
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...patch }
        setUsers((list) => list.map((item) => (item.nick === prev.nick ? next : item)))
        return next
      })
    }

    function addSignal(title, text) {
      if (!notificationsOn) return
      setSignals((prev) => [
        { id: `sig-${Date.now()}`, title, text, time: nowLabel(), unread: true },
        ...prev,
      ])
    }

    function pushIncoming(chatId, message) {
      setChats((prev) => {
        const chat = prev.find((item) => item.id === chatId)
        if (!chat || chat.muted) {
          if (chat?.muted) {
            return prev.map((item) => (item.id === chatId ? { ...item, typing: false } : item))
          }
          return prev
        }
        const incoming = { id: `m-${Date.now()}`, time: nowLabel(), ...message }
        const messages = chat.messages.map((item) => (item.mine ? { ...item, status: 'read' } : item))
        return bumpChat(prev, chatId, {
          messages: [...messages, incoming],
          preview: incoming.text,
          time: incoming.time,
          typing: false,
          unread: activeChatId === chatId ? 0 : (chat.unread || 0) + 1,
          badge: undefined,
        })
      })
      const chat = chats.find((item) => item.id === chatId)
      if (!chat?.muted) addSignal(message.author || 'Нить', message.text)
    }

    function sendMessage(chatId, text, reply) {
      const clean = text.trim()
      if (!clean) return
      const time = nowLabel()
      setChats((prev) => {
        const chat = prev.find((item) => item.id === chatId)
        if (!chat) return prev
        const mine = {
          id: `m-${Date.now()}`,
          author: user?.name || 'Я',
          mine: true,
          text: clean,
          time,
          status: 'sent',
          meta: 'одна нить',
          replyTo: reply ? { author: reply.author, text: reply.text } : null,
        }
        return bumpChat(prev, chatId, {
          messages: [...chat.messages, mine],
          preview: clean,
          time,
          typing: false,
          unread: 0,
          badge: undefined,
        })
      })
    }

    function markChatRead(chatId) {
      setActiveChatId(chatId)
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat)))
    }

    function chatFromPerson(person) {
      return {
        id: person.id,
        kind: 'dm',
        name: person.name,
        letter: person.letter,
        tone: person.tone,
        online: person.online,
        typing: false,
        preview: 'Ещё ни одной нити',
        time: 'новый',
        unread: 0,
        messages: [],
        handle: person.handle,
        lastSeen: person.lastSeen || (person.online ? 'на нити' : 'давно'),
        about: person.about,
        threads: person.threads,
        streak: person.streak,
        freq: person.freq,
        pinned: false,
        muted: false,
      }
    }

    function addContact(personId) {
      const person = directory.find((item) => item.id === personId)
      if (!person) return null
      const existing = chats.find((chat) => chat.id === personId)
      if (existing) return existing.id
      const chat = chatFromPerson(person)
      setChats((prev) => {
        if (prev.some((item) => item.id === personId)) return prev
        const group = prev.find((item) => item.id === 'vams')
        const rest = prev.filter((item) => item.id !== 'vams')
        const pinned = rest.filter((item) => item.pinned)
        const loose = rest.filter((item) => !item.pinned)
        return group ? [group, ...pinned, chat, ...loose] : [chat, ...pinned, ...loose]
      })
      addSignal(person.name, 'Новая нить легла в контакты')
      return person.id
    }

    function deleteMessage(chatId, messageId) {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat
          const messages = chat.messages.filter((item) => item.id !== messageId)
          const last = messages[messages.length - 1]
          return {
            ...chat,
            messages,
            preview: last ? last.text : 'Ещё ни одной нити',
            time: last ? last.time : chat.time,
          }
        }),
      )
    }

    function togglePin(chatId) {
      setChats((prev) => bumpChat(prev.map((chat) => (chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat)), chatId, {}))
    }

    function toggleMute(chatId) {
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, muted: !chat.muted } : chat)))
    }

    function removeChat(chatId) {
      if (chatId === 'vams') return
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (activeChatId === chatId) setActiveChatId('vams')
    }

    function createGroup(name, memberIds) {
      const members = (memberIds || [])
        .map((id) => chats.find((chat) => chat.id === id && chat.kind === 'dm'))
        .filter(Boolean)
      if (members.length < 2) return null
      const title = (name || '').trim() || members.map((item) => item.name).slice(0, 3).join(', ')
      const id = `g-${Date.now()}`
      const chat = {
        id,
        kind: 'group',
        name: title,
        letter: title.slice(0, 1).toUpperCase(),
        tone: 'cool',
        online: true,
        typing: false,
        preview: `${members.length} на нити`,
        time: 'новый',
        unread: 0,
        messages: [],
        members: members.map((item) => ({ id: item.id, name: item.name, letter: item.letter, tone: item.tone })),
        about: members.map((item) => item.name).join(', '),
        pinned: false,
        muted: false,
      }
      setChats((prev) => {
        const group = prev.find((item) => item.id === 'vams')
        const rest = prev.filter((item) => item.id !== 'vams')
        return group ? [group, chat, ...rest] : [chat, ...rest]
      })
      addSignal(title, 'Группа сплетена из контактов')
      return id
    }

    function openOrCreateChat(nick) {
      const clean = nick.trim()
      if (!clean) return null
      const found = chats.find((chat) => chat.name.toLowerCase() === clean.toLowerCase())
      if (found) return found.id
      const id = `c-${Date.now()}`
      const chat = {
        id,
        kind: 'dm',
        name: clean,
        letter: clean.slice(0, 1).toUpperCase(),
        tone: 'hot',
        online: false,
        typing: false,
        preview: 'Ещё ни одной нити',
        time: 'новый',
        unread: 0,
        messages: [],
      }
      setChats((prev) => {
        const group = prev.find((item) => item.id === 'vams')
        const rest = prev.filter((item) => item.id !== 'vams')
        return group ? [group, chat, ...rest] : [chat, ...rest]
      })
      return id
    }

    function markSignalsRead() {
      setSignals((prev) => prev.map((item) => ({ ...item, unread: false })))
    }

    return {
      theme,
      setTheme,
      user,
      chats,
      signals,
      notificationsOn,
      setNotificationsOn,
      readReceipts,
      setReadReceipts,
      presence,
      setPresence,
      activeChatId,
      login,
      register,
      logout,
      updateProfile,
      directory,
      sendMessage,
      markChatRead,
      openOrCreateChat,
      addContact,
      createGroup,
      deleteMessage,
      togglePin,
      toggleMute,
      removeChat,
      markSignalsRead,
    }
  }, [theme, users, user, chats, signals, notificationsOn, readReceipts, presence, activeChatId])

  return <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>
}

export function useApp() {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
