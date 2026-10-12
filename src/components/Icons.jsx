function dots(radius, size) {
  return [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const angle = (deg * Math.PI) / 180
    return <circle key={deg} cx={12 + Math.cos(angle) * radius} cy={12 + Math.sin(angle) * radius} r={size} fill="currentColor" />
  })
}

export function IconChat() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.2 5.8h8.4A2.4 2.4 0 0 1 19 8.2v5.1a2.4 2.4 0 0 1-2.4 2.4h-5.2L7.6 19.2v-3.5h-.2A2.4 2.4 0 0 1 5 13.3V8.2A2.4 2.4 0 0 1 7.4 5.8h.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconWeb() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.15" fill="currentColor" />
      {dots(6.15, 1.55)}
    </svg>
  )
}

export function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      {dots(6.5, 1.05)}
    </svg>
  )
}

export function IconSun() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const angle = (deg * Math.PI) / 180
        const x1 = 12 + Math.cos(angle) * 5.3
        const y1 = 12 + Math.sin(angle) * 5.3
        const x2 = 12 + Math.cos(angle) * 8.3
        const y2 = 12 + Math.sin(angle) * 8.3
        return <path key={deg} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      })}
    </svg>
  )
}

export function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.6 15.6 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.2 4.8h2.1l1.2 3.1-1.5 1.1a12 12 0 0 0 5 5l1.1-1.5 3.1 1.2v2.1c0 .8-.6 1.5-1.4 1.6A14.2 14.2 0 0 1 6.6 6.2c.1-.8.8-1.4 1.6-1.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconClip() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.5 12.5 14 7a3 3 0 0 1 4.2 4.2l-7.2 7.2a4.2 4.2 0 0 1-6-6L12 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconStar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3.8 1.7 4.8h5.1l-4.1 3.1 1.6 4.9L12 13.8 7.7 16.6l1.6-4.9-4.1-3.1h5.1L12 3.8Z" fill="currentColor" />
    </svg>
  )
}

export function IconClose() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
