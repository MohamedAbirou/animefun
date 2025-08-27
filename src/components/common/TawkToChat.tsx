import { useEffect } from 'react'

declare global {
  interface Window {
    Tawk_API?: any
    Tawk_LoadStart?: Date
  }
}

const TawkToChat = () => {
  useEffect(() => {
    // Tawk.to script
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://embed.tawk.to/6829e22246de03190a9d0c38/1irhpmlh7'
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    
    // Add script to document
    document.head.appendChild(script)
    
    return () => {
      // Cleanup
      document.head.removeChild(script)
    }
  }, [])

  return null
}

export default TawkToChat