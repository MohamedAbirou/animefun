import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-dark-bg px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-extrabold text-primary-600 dark:text-primary-400">404</h1>
        <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page Not Found</p>
        <p className="mt-6 text-base text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for. The page might have been removed or is temporarily unavailable.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center px-6 py-3 text-base"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage