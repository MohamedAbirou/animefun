import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingScreen from './components/common/LoadingScreen'
import AdminLayout from './layouts/AdminLayout'
import RootLayout from './layouts/RootLayout'
import AdminPendingApproval from './pages/admin/AdminPendingApproval'
import HomePage from './pages/HomePage'

// Lazy-loaded pages
const WallpapersPage = lazy(() => import('./pages/WallpapersPage'))
const WallpaperDetailsPage = lazy(() => import('./pages/WallpaperDetailsPage'))
const QuizzesPage = lazy(() => import('./pages/QuizzesPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const QuizResultsPage = lazy(() => import('./pages/QuizResultsPage'))
const GamesPage = lazy(() => import('./pages/GamesPage'))
const GameDetailsPage = lazy(() => import('./pages/GameDetailsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Legal and Info pages
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))
const CopyrightPage = lazy(() => import('./pages/CopyrightPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminWallpapersPage = lazy(() => import('./pages/admin/AdminWallpapersPage'))
const AdminQuizzesPage = lazy(() => import('./pages/admin/AdminQuizzesPage'))
const AdminGamesPage = lazy(() => import('./pages/admin/AdminGamesPage'))
const AdminSeriesPage = lazy(() => import('./pages/admin/AdminSeriesPage'))
const AdminCharactersPage = lazy(() => import('./pages/admin/AdminCharactersPage'))
const AdminStatsPage = lazy(() => import('./pages/admin/AdminStatsPage'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))

function App() {

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="wallpapers">
            <Route index element={<WallpapersPage />} />
            <Route path=":id" element={<WallpaperDetailsPage />} />
          </Route>
          <Route path="quizzes">
            <Route index element={<QuizzesPage />} />
            <Route path=":id" element={<QuizPage />} />
            <Route path=":id/results/:resultId" element={<QuizResultsPage />} />
          </Route>
          <Route path="games">
            <Route index element={<GamesPage />} />
            <Route path=":id" element={<GameDetailsPage />} />
          </Route>
          
          {/* Legal and Info Routes */}
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-of-service" element={<TermsOfServicePage />} />
          <Route path="copyright" element={<CopyrightPage />} />
          <Route path="faq" element={<FAQPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/pending-approval" element={<AdminPendingApproval />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="wallpapers" element={<AdminWallpapersPage />} />
          <Route path="quizzes" element={<AdminQuizzesPage />} />
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="series" element={<AdminSeriesPage />} />
          <Route path="characters" element={<AdminCharactersPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App