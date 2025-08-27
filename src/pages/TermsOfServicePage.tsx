const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using AnimeFun, you accept and agree to be bound by the terms and provisions
            of this agreement. If you do not agree to these terms, do not use our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (wallpapers, games) on AnimeFun for personal, non-commercial transitory viewing only.</p>
          <p className="mt-4">This license shall automatically terminate if you violate any of these restrictions and may be terminated by AnimeFun at any time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
          <p>
            The materials on AnimeFun are provided on an 'as is' basis. AnimeFun makes no warranties,
            expressed or implied, and hereby disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability, fitness for a particular
            purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
          <p>
            In no event shall AnimeFun or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising
            out of the use or inability to use the materials on AnimeFun.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Content Usage</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Wallpapers are for personal use only</li>
            <li>Games must not be redistributed or modified</li>
            <li>Quiz results are for entertainment purposes only</li>
            <li>Commercial use of any content is strictly prohibited</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any portion of the website</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Collect or store personal data about other users</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
          <p>
            AnimeFun may revise these terms of service at any time without notice. By using this website,
            you are agreeing to be bound by the current version of these terms of service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws and
            you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>
      </div>
    </div>
  )
}

export default TermsOfServicePage