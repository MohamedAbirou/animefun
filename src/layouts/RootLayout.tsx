import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/common/ScrollToTop'
import { useEffect } from 'react'

const RootLayout = () => {
  // Generate a session ID if one doesn't exist
  useEffect(() => {
    if (!localStorage.getItem('session_id')) {
      // Generate a random session ID for tracking
      const sessionId = crypto.randomUUID()
      localStorage.setItem('session_id', sessionId)
    }
  }, [])
  
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200">
      <ScrollToTop />
      <Header />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  )
}

export default RootLayout