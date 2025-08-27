import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'
import ThemeToggle from '@/components/common/ThemeToggle'
import clsx from 'clsx'

const AdminHeader = () => {
  const { user, logout } = useAuthStore()
  const { toggle } = useSidebarStore()
  
  return (
    <header className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white dark:bg-dark-sidebar border-b border-gray-200 dark:border-dark-border flex">
      <div className="flex-1 flex justify-between px-4">
        <div className="flex-1 flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggle}
            className="md:hidden px-4 border-r border-gray-200 dark:border-dark-border text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="ml-4 text-gray-900 dark:text-white text-lg font-medium hidden sm:block">
            Admin Dashboard
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <ThemeToggle />
          
          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-card ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1 border-b border-gray-200 dark:border-dark-border">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>Signed in as</p>
                    <p className="font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={clsx(
                          'flex w-full items-center px-4 py-2 text-sm',
                          active
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader