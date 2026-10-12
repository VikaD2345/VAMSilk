export default function Brand({ withName = true }) {
  return (
    <div className="brand">
      <span className="brand-mark">V</span>
      {withName ? <span className="brand-name">VAMSilk</span> : null}
    </div>
  )
}

export function GlitchTitle({ as: Tag = 'h1', children, className = '' }) {
  return (
    <Tag className={`glitch ${className}`} data-text={children}>
      {children}
    </Tag>
  )
}
