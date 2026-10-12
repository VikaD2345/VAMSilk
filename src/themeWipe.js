export function paintTheme(next, _event, setTheme) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTheme(next)
    return
  }
  const veil = document.createElement('div')
  veil.className = 'theme-silk'
  veil.dataset.next = next
  document.body.appendChild(veil)

  const cover = veil.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 260, easing: 'ease-in', fill: 'forwards' },
  )

  cover.onfinish = () => {
    setTheme(next)
    const started = performance.now()
    const waitForPaint = () => {
      if (document.documentElement.dataset.theme !== next && performance.now() - started < 800) {
        requestAnimationFrame(waitForPaint)
        return
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          veil.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 340, easing: 'ease-out', fill: 'forwards' },
          ).onfinish = () => veil.remove()
        })
      })
    }
    requestAnimationFrame(waitForPaint)
  }
}
