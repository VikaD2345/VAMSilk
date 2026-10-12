export default function Spider({ className = '' }) {
  return (
    <div className={`spider-swing ${className}`}>
      <img className="mascot only-light" src="/mascot-light.png?v=7" alt="" />
      <img className="mascot only-dark" src="/mascot-dark.png?v=7" alt="" />
    </div>
  )
}
