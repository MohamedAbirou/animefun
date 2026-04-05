import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEOHead
        title="About AnimeFun — Anime Wallpapers, Quizzes & Games"
        description="Learn about AnimeFun, the free platform for anime fans offering high-quality wallpapers, personality quizzes, and mobile games. Discover our mission and what makes us unique."
        canonical="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About AnimeFun",
          description:
            "AnimeFun is a free platform dedicated to anime fans, offering high-quality wallpapers, personality quizzes, and mobile games.",
          url: "https://animefun.net/about",
          publisher: {
            "@type": "Organization",
            name: "AnimeFun",
            url: "https://animefun.net",
            logo: {
              "@type": "ImageObject",
              url: "https://animefun.net/favicon.svg",
            },
          },
        }}
      />

      {/* Hero */}
      <div className="text-center mb-14">
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img src="/favicon.svg" alt="AnimeFun Logo" className="h-16 w-auto" />
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 font-display">
          About AnimeFun
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          The free, community-first platform where anime fans discover stunning
          wallpapers, explore their personality through quizzes, and find the
          best mobile games inspired by their favourite series.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-12 bg-white dark:bg-dark-card rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-dark-border">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Our Mission
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          AnimeFun was built with a single goal: to give anime enthusiasts
          around the world a dedicated, high-quality destination they can return
          to every day. We believe that passion for anime deserves more than
          scattered forums and low-resolution image searches. By bringing
          wallpapers, quizzes, and game recommendations under one roof —
          completely free — we make it effortless for fans to celebrate the
          stories and characters they love.
        </p>
      </section>

      {/* What We Offer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallpapers */}
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 mb-4">
              <svg
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9h.008v.008H3V9zm0 3.75h.008v.008H3V12.75zM21 3v18H3V3h18z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Anime Wallpapers
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">
              Browse hundreds of high-resolution wallpapers spanning popular
              series from every era. Optimised for desktop and mobile screens,
              each image is carefully curated for quality and visual impact.
            </p>
            <Link
              to="/wallpapers"
              className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Browse wallpapers →
            </Link>
          </div>

          {/* Quizzes */}
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 mb-4">
              <svg
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Personality Quizzes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">
              Find out which anime character matches your personality with our
              fun, shareable quizzes. New quizzes are added regularly across all
              major genres and series.
            </p>
            <Link
              to="/quizzes"
              className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Take a quiz →
            </Link>
          </div>

          {/* Games */}
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border flex flex-col">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 mb-4">
              <svg
                className="w-6 h-6 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Mobile Games
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">
              Discover and download the best anime-themed mobile games for
              Android. Each listing includes detailed descriptions, screenshots,
              and easy download instructions.
            </p>
            <Link
              to="/games"
              className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Explore games →
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="mb-12 bg-white dark:bg-dark-card rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-dark-border">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Who We Are
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          AnimeFun is an independently operated website run by anime fans, for
          anime fans. We are not affiliated with any anime studio, publisher, or
          broadcaster. Our team maintains the platform with a focus on quality,
          safety, and accessibility — ensuring that content is appropriate for a
          general audience and continually updated to reflect the latest and
          greatest in the anime world.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          We take copyright seriously. All character artwork used on this site
          is either licensed, created specifically for AnimeFun, or used under
          fair-use principles for fan commentary and appreciation. If you
          believe any content infringes your rights, please{" "}
          <Link
            to="/copyright"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            read our copyright policy
          </Link>{" "}
          and contact us directly.
        </p>
      </section>

      {/* Our Values */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Our Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              title: "Free & Accessible",
              desc: "Every feature on AnimeFun is completely free. No subscriptions, no paywalls, no sign-ups required to enjoy the content.",
            },
            {
              title: "Community First",
              desc: "We listen to our users. New content, quiz topics, and game listings are driven by what the community wants to see.",
            },
            {
              title: "Safe & Family-Friendly",
              desc: "All content is moderated to maintain a safe environment. We do not host adult, violent, or otherwise harmful material.",
            },
            {
              title: "Privacy Respecting",
              desc: "We collect only the minimum data necessary to operate the platform and never sell your information to third parties.",
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="flex gap-4 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border"
            >
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mt-0.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-12 bg-white dark:bg-dark-card rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-dark-border">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Contact Us
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          Have a question, a suggestion, or a content concern? We'd love to hear
          from you. You can reach our team by email and we aim to respond within
          2 business days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:contact@animefun.net"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            contact@animefun.net
          </a>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-300 font-medium transition-colors text-sm"
          >
            View FAQ →
          </Link>
        </div>
      </section>

      {/* Legal links */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
        <Link
          to="/privacy-policy"
          className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
        >
          Privacy Policy
        </Link>
        <span>·</span>
        <Link
          to="/terms-of-service"
          className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
        >
          Terms of Service
        </Link>
        <span>·</span>
        <Link
          to="/copyright"
          className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
        >
          Copyright
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
