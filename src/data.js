export const DEMO_USER = {
  nick: 'Ты',
  password: '67',
  name: 'Я',
  handle: '@na_nitke',
  bio: 'Держу реплику №67. Если чат моргнул — это не я, это HAProxy. Самая толстая нить ведёт к Ане.',
  threads: 128,
  days: 42,
  replica: 67,
}

export function nowLabel() {
  const date = new Date()
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const strangers = [
  { id: 'kira', name: 'Кира', letter: 'К', tone: 'cool', online: true, handle: '@kira', lastSeen: 'на нити', about: 'Плетёт интерфейсы и ловит реплики на лету.', threads: 88, streak: 6, freq: 'often' },
  { id: 'mira', name: 'Мира', letter: 'М', tone: 'hot', online: true, handle: '@mira', lastSeen: 'на нити', about: 'Короткие нити, быстрые ответы.', threads: 54, streak: 3, freq: 'rare' },
  { id: 'denis', name: 'Денис', letter: 'Д', tone: 'cool', online: false, handle: '@denis', lastSeen: 'была 2 ч назад', about: 'Держит ночную реплику.', threads: 19, streak: 1, freq: 'rare' },
  { id: 'olya', name: 'Оля', letter: 'О', tone: 'hot', online: true, handle: '@olya', lastSeen: 'на нити', about: 'Самая яркая нить в соседнем секторе.', threads: 240, streak: 11, freq: 'often' },
  { id: 'timur', name: 'Тимур', letter: 'Т', tone: 'cool', online: false, handle: '@timur', lastSeen: 'вчера', about: 'Пишет редко, но нить не рвёт.', threads: 7, streak: 1, freq: 'rare' },
  { id: 'vera', name: 'Вера', letter: 'В', tone: 'hot', online: true, handle: '@vera', lastSeen: 'на нити', about: 'Следит, чтобы паутина не путалась.', threads: 130, streak: 8, freq: 'constant' },
  { id: 'polina', name: 'Полина', letter: 'П', tone: 'cool', online: false, handle: '@polina', lastSeen: '3 дня назад', about: 'Новая нить, ещё без истории.', threads: 2, streak: 1, freq: 'rare' },
  { id: 'artem', name: 'Артём', letter: 'А', tone: 'hot', online: true, handle: '@artem', lastSeen: 'на нити', about: 'Гоняет нагрузку и считает rps.', threads: 410, streak: 15, freq: 'often' },
]

export const people = [
  {
    id: 'anya',
    name: 'Аня',
    handle: '@anya',
    lastSeen: 'на нити',
    letter: 'А',
    tone: 'cool',
    online: true,
    typing: false,
    freq: 'constant',
    spot: 'top',
    threads: 1204,
    streak: 42,
    about: 'Самая толстая нить в твоей паутине. Вы переписываетесь каждый день.',
    preview: 'кинь конфиг docker-compose',
    time: '13:40',
    unread: 1,
    messages: [
      {
        id: 'anya-1',
        author: 'Аня',
        letter: 'А',
        tone: 'cool',
        text: 'кинь конфиг docker-compose',
        time: '13:40',
      },
    ],
  },
  {
    id: 'max',
    name: 'Макс',
    handle: '@max',
    lastSeen: 'на нити',
    letter: 'М',
    tone: 'hot',
    online: true,
    freq: 'rare',
    spot: 'tr',
    threads: 86,
    streak: 4,
    about: 'Редкая нить. Макс появляется, когда реплика уже горит.',
    preview: 'огонь, мержу',
    time: '12:15',
    unread: 0,
    messages: [
      {
        id: 'max-1',
        author: 'Я',
        mine: true,
        text: 'глянь дифф на реплике №3',
        time: '12:11',
        meta: 'одна нить',
      },
      {
        id: 'max-2',
        author: 'Макс',
        letter: 'М',
        tone: 'hot',
        text: 'огонь, мержу',
        time: '12:15',
      },
    ],
  },
  {
    id: 'sasha',
    name: 'Саша',
    handle: '@sasha',
    lastSeen: 'на нити',
    letter: 'С',
    tone: 'cool',
    online: true,
    freq: 'often',
    spot: 'br',
    threads: 640,
    streak: 18,
    about: 'Частая нить. Саша держит нагрузку и не роняет реплики.',
    preview: 'кб выдал 1200 rps без ошибок',
    time: 'вчера',
    unread: 0,
    messages: [
      {
        id: 'sasha-1',
        author: 'Саша',
        letter: 'С',
        tone: 'cool',
        text: 'кб выдал 1200 rps без ошибок',
        time: 'вчера',
      },
    ],
  },
  {
    id: 'lesha',
    name: 'Лёша',
    handle: '@lesha',
    lastSeen: 'на нити',
    letter: 'Л',
    tone: 'hot',
    online: true,
    freq: 'constant',
    spot: 'bottom',
    threads: 12,
    streak: 2,
    about: 'Нить только легла. Лёша ещё молчит.',
    preview: 'Ещё ни одной нити',
    time: 'новый',
    unread: 0,
    messages: [],
  },
  {
    id: 'nora',
    name: 'Нора',
    handle: '@nora',
    lastSeen: 'вчера',
    letter: 'Н',
    tone: 'hot',
    online: false,
    freq: 'rare',
    spot: 'bl',
    threads: 40,
    streak: 1,
    about: 'Тонкая нить. Нора пишет редко, но метко.',
    preview: 'реплика моргнула, я на №2',
    time: 'пн',
    unread: 0,
    messages: [
      {
        id: 'nora-1',
        author: 'Нора',
        letter: 'Н',
        tone: 'hot',
        text: 'реплика моргнула, я на №2',
        time: 'пн',
      },
    ],
  },
  {
    id: 'gleb',
    name: 'Глеб',
    handle: '@gleb',
    lastSeen: 'вс',
    letter: 'Г',
    tone: 'cool',
    online: false,
    freq: 'rare',
    spot: 'left',
    threads: 210,
    streak: 9,
    about: 'Тихая нить сбоку паутины. Глеб на связи через раз.',
    preview: 'потом допишу на нить',
    time: 'вс',
    unread: 0,
    messages: [
      {
        id: 'gleb-1',
        author: 'Глеб',
        letter: 'Г',
        tone: 'cool',
        text: 'потом допишу на нить',
        time: 'вс',
      },
    ],
  },
]

export const groupMessages = [
  {
    id: 'g1',
    author: 'Саша',
    letter: 'С',
    tone: 'cool',
    text: 'Запустил кб на 1000 юзеров, держимся',
    time: '13:52',
  },
  {
    id: 'g2',
    author: 'Я',
    mine: true,
    text: 'Гашу реплику №1, смотрим, кто выживет',
    time: '13:55',
    meta: 'две нити',
  },
  {
    id: 'g3',
    author: 'Макс',
    letter: 'М',
    tone: 'hot',
    text: 'Меня перекинуло на №3, чат даже не моргнул',
    time: '13:56',
  },
  {
    id: 'g4',
    author: 'Аня',
    letter: 'А',
    tone: 'cool',
    text: 'HAProxy живой, три реплики держат',
    time: '14:01',
  },
]

export const directory = [...people, ...strangers]

export function createInitialChats() {
  const group = {
    id: 'vams',
    kind: 'group',
    name: 'Команда VAMS',
    letter: 'V',
    tone: 'hot',
    online: true,
    typing: false,
    typingName: 'Аня',
    preview: 'Аня плетёт сообщение...',
    time: '6:07',
    unread: 0,
    badge: '67',
    messages: groupMessages,
  }

  const directs = people.map((person) => ({
    id: person.id,
    kind: 'dm',
    name: person.name,
    letter: person.letter,
    tone: person.tone,
    online: person.online,
    typing: Boolean(person.typing),
    typingName: person.name,
    preview: person.preview,
    time: person.time,
    unread: person.unread,
    messages: person.messages,
    handle: person.handle,
    lastSeen: person.lastSeen,
    about: person.about,
    threads: person.threads,
    streak: person.streak,
    freq: person.freq,
    pinned: false,
    muted: false,
  }))

  return [group, ...directs]
}

export const initialSignals = [
  {
    id: 's1',
    title: 'Аня кинула тебе нить',
    text: '«кинь конфиг docker-compose»',
    time: '13:40',
    unread: true,
  },
  {
    id: 's2',
    title: 'Саша плетёт в Команде VAMS',
    text: 'Запустил кб на 1000 юзеров, держимся',
    time: '13:52',
    unread: true,
  },
  {
    id: 's3',
    title: 'Реплика №67 живая',
    text: 'HAProxy держит три реплики. Паутина на месте.',
    time: '14:01',
    unread: false,
  },
]

export const replies = {
  anya: [
    'Ловлю нить. Конфиг docker-compose уже на реплике.',
    'HAProxy не моргнул. Можешь стрелять дальше.',
  ],
  max: ['Вижу. Мержу, если реплика не моргнёт.', 'Огонь. Нить толстая, не порвётся.'],
  sasha: ['Кб ещё держит. 1200 rps, ошибок нет.', 'Реплика №2 живая, я на ней.'],
  lesha: ['Первая нить легла. Я на связи.', 'Поймал. Пиши, если реплика моргнёт.'],
  nora: ['Я на №2. Если что — дёргай нить.', 'Редко пишу, но эту нить вижу.'],
  gleb: ['Допишу позже, нить не рву.', 'Увидел. Отвечу, когда реплика отпустит.'],
  vams: [
    { author: 'Аня', letter: 'А', tone: 'cool', text: 'Нить поймала. Реплика даже не моргнула.' },
    { author: 'Макс', letter: 'М', tone: 'hot', text: 'Если упадёт №1 — я уже на №3.' },
    { author: 'Саша', letter: 'С', tone: 'cool', text: 'Нагрузку держу. Паутина целая.' },
  ],
}

export const splashTips = [
  'Совет от Вамсика: напиши в любой чат «67» и смотри, что будет',
  'Совет от Вамсика: чем толще нить, тем чаще вы на связи',
  'Совет от Вамсика: реплика №67 запоминает, кто на нити',
]

export const splashStatuses = [
  'Ищем свободную нить...',
  'Подключаемся к реплике через HAProxy...',
  'Плетём паутину для твоих чатов...',
]
