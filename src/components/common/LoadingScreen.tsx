import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  message?: string
}

const tips = [
  "The journey of a thousand miles begins with a single step.",
  "Patience is a key element of success.",
  "Every accomplishment starts with the decision to try.",
  "Stay positive, work hard, make it happen.",
]

const FADE_DURATION = 500 // ms, adjust for fade in/out speed
const TIP_DISPLAY_DURATION = 4000 // ms, how long tip stays visible before fading out

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  const [showTip, setShowTip] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [visible, setVisible] = useState(false) // controls opacity

  // Show a tip after 3 seconds of loading
  useEffect(() => {
    const showTipTimer = setTimeout(() => {
      setShowTip(true)
      setVisible(true) // start visible when showing tip
    }, 3000)

    return () => clearTimeout(showTipTimer)
  }, [])

  // Manage fade in/out and tip cycling
  useEffect(() => {
    if (!showTip) return

    // This function handles fade out, tip change, fade in cycle
    const cycleTips = () => {
      setVisible(false) // fade out

      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length) // change tip
        setVisible(true) // fade in
      }, FADE_DURATION)
    }

    const interval = setInterval(() => {
      cycleTips()
    }, TIP_DISPLAY_DURATION + FADE_DURATION) // total cycle time

    return () => clearInterval(interval)
  }, [showTip])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-dark-bg transition-colors duration-200 z-50">
      <div className="relative w-24 h-24">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-transparent border-r-accent-500 border-b-transparent border-l-transparent animate-spin animation-delay-150"></div>
        <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-transparent border-r-transparent border-b-secondary-500 border-l-transparent animate-spin animation-delay-300"></div>
      </div>

      <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">{message}</h2>

      {showTip && (
        <div
          className="mt-8 max-w-sm text-center text-gray-600 dark:text-gray-400"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        >
          <p className="italic">"{tips[tipIndex]}"</p>
        </div>
      )}
    </div>
  )
}

export default LoadingScreen