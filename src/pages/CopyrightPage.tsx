const CopyrightPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Copyright Notice</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Copyright Policy</h2>
          <p>
            All content on AnimeFun, including but not limited to text, graphics, logos, images,
            audio clips, digital downloads, and data compilations, is the property of AnimeFun
            or its content suppliers and is protected by international copyright laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Fair Use</h2>
          <p>
            The wallpapers, games, and other content available on AnimeFun are provided for personal,
            non-commercial use only. Any other use of the content without prior written consent
            from the respective copyright holders is prohibited.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
          <p>
            All anime-related content, characters, and properties are owned by their respective
            copyright holders. AnimeFun does not claim ownership of these properties and provides
            content under fair use for entertainment purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">DMCA Compliance</h2>
          <p>
            We respect the intellectual property rights of others and expect our users to do the same.
            If you believe that your copyrighted work has been copied in a way that constitutes
            copyright infringement, please provide our copyright agent with the following information:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>A description of the copyrighted work that you claim has been infringed</li>
            <li>A description of where the material you claim is infringing is located on the site</li>
            <li>Your address, telephone number, and email address</li>
            <li>A statement by you that you have a good faith belief that the disputed use is not authorized</li>
            <li>A statement by you, made under penalty of perjury, that the above information is accurate</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Takedown Requests</h2>
          <p>
            If you are a copyright holder or authorized to act on behalf of one and believe that
            any content on our site infringes your copyright, please contact us at:
            copyright@AnimeFun.com
          </p>
          <p className="mt-4">
            We will respond to notices of alleged copyright infringement that comply with applicable
            law and are properly provided to us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
          <p>
            We reserve the right to modify this copyright notice at any time. Changes will be
            effective immediately upon posting on this page.
          </p>
        </section>
      </div>
    </div>
  )
}

export default CopyrightPage