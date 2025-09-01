const FAQPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">General Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                What is AnimeFun?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AnimeFun is a platform dedicated to anime fans, offering high-quality wallpapers,
                personality quizzes, and mobile games. Our goal is to provide an engaging and
                entertaining experience for anime enthusiasts.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Is AnimeFun free to use?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, AnimeFun is free to use!
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Wallpapers</h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                What wallpaper formats are available?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We offer wallpapers in various formats:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-400">
                <li>Desktop wallpapers (optimized for various screen resolutions)</li>
                <li>Mobile wallpapers (for smartphones and tablets)</li>
                <li>Special collections including sketchy versions</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                How do I download wallpapers?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simply browse our wallpaper collection, select the one you like, and click the
                download button.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Personality Quizzes</h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                How do the personality quizzes work?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our quizzes use a sophisticated algorithm to match your answers with anime character
                personalities. Answer the questions honestly, and we'll reveal which character matches
                your personality traits!
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Can I share my quiz results?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! After completing a quiz, you can easily share your results on social media
                or copy the link to share with friends.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Mobile Games</h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                How do I install the mobile games?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our mobile games are provided as APK files for Android devices. After downloading,
                you'll need to enable installation from unknown sources in your device settings.
                Follow the installation prompts to start playing.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Are the games safe to install?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All our games are thoroughly tested and scanned for malware before being made
                available. We prioritize user safety and security.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Technical Support</h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                What should I do if I encounter issues?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you experience any technical issues, try:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-400">
                <li>Refreshing the page</li>
                <li>Clearing your browser cache</li>
                <li>Using a different browser</li>
                <li>Contacting our support team at support@AnimeFun.com</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Which browsers are supported?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AnimeFun works best with modern browsers like Chrome, Firefox, Safari, and Edge.
                Make sure your browser is up to date for the best experience.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default FAQPage