// Tal, der glider fra den gamle til den nye værdi. Kun visning: værdien kommer færdigberegnet fra src/core.

import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 450

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function useTweenedValue(target: number): number {
  const [shown, setShown] = useState(target)
  const shownRef = useRef(target)

  useEffect(() => {
    const from = shownRef.current
    if (from === target || prefersReducedMotion()) {
      shownRef.current = target
      setShown(target)
      return
    }
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / DURATION_MS)
      const eased = 1 - (1 - t) ** 3
      const value = t === 1 ? target : from + (target - from) * eased
      shownRef.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [target])

  return shown
}

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
}

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const shown = useTweenedValue(value)
  // Skærmlæsere får den endelige værdi, ikke mellemtrinene.
  return (
    <>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  )
}
