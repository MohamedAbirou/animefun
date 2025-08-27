import { Link, NavLink } from 'react-router-dom'
import { useSidebarStore } from '@/store/sidebarStore'
import {
  HomeIcon,
  PhotoIcon,
  QuestionMarkCircleIcon,
  PuzzlePieceIcon,
  FilmIcon,
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Wallpapers', href: '/admin/wallpapers', icon: PhotoIcon },
  { name: 'Quizzes', href: '/admin/quizzes', icon: QuestionMarkCircleIcon },
  { name: 'Games', href: '/admin/games', icon: PuzzlePieceIcon },
  { name: 'Anime Series', href: '/admin/series', icon: FilmIcon },
  { name: 'Characters', href: '/admin/characters', icon: UserIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
  { name: 'Statistics', href: '/admin/stats', icon: ChartBarIcon },
  { name: 'Admin Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

const AdminSidebar = () => {
  const { isOpen, toggle } = useSidebarStore()
  
  return (
    <>
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-40 md:hidden transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={toggle}
        />
        
        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-dark-sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggle}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/admin" className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/favicon.svg"
                  alt="AnimeFun Logo"
                />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white font-display">
                  Admin Panel
                </span>
              </Link>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )
                  }
                  end={item.href === '/admin'}
                  onClick={toggle}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-6 w-6',
                      'text-gray-500 dark:text-gray-400'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-dark-border p-4">
            <Link 
              to="/"
              className="flex-shrink-0 w-full group block"
              onClick={toggle}
            >
              <div className="flex items-center">
                <div>
                  <HomeIcon className="inline-block h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Return to Website
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-dark-sidebar border-r border-gray-200 dark:border-dark-border">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link to="/admin" className="flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/favicon.svg"
                    alt="AnimeFun Logo"
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white font-display">
                    Admin Panel
                  </span>
                </Link>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                        isActive
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      )
                    }
                    end={item.href === '/admin'}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 flex-shrink-0 h-6 w-6',
                        'text-gray-500 dark:text-gray-400'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-dark-border p-4">
              <Link 
                to="/"
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <HomeIcon className="inline-block h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Return to Website
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar