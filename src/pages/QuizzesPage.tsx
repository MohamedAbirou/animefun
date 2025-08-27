import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { Quiz } from "@/types/quiz";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface QuizzesByAnime {
  [animeId: string]: {
    animeName: string;
    quizzes: Quiz[];
  };
}

const QuizzesPage = () => {
  const [defaultQuiz, setDefaultQuiz] = useState<Quiz | null>(null);
  const [quizzesByAnime, setQuizzesByAnime] = useState<QuizzesByAnime>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);

      // Fetch all quizzes
      const { data: quizzes, error } = await supabase
        .from("quizzes")
        .select("*, anime_series(id, name)")
        .order("completion_count", { ascending: false });

      if (error) throw error;

      // Find default quiz
      const defaultQuiz = quizzes.find((q) => q.is_default);
      if (defaultQuiz) {
        setDefaultQuiz(defaultQuiz as any);
      }

      // Group other quizzes by anime
      const grouped = quizzes
        .filter((q) => !q.is_default)
        .reduce((acc: QuizzesByAnime, quiz) => {
          if (!quiz.anime_series) return acc;

          const animeId = quiz.anime_series.id;
          if (!acc[animeId]) {
            acc[animeId] = {
              animeName: quiz.anime_series.name,
              quizzes: [],
            };
          }
          acc[animeId].quizzes.push(quiz as any);
          return acc;
        }, {});

      setQuizzesByAnime(grouped);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Personality Quizzes
      </h1>

      {/* Featured Quiz */}
      {defaultQuiz && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Featured Quiz
          </h2>
          <Link
            to={`/quizzes/${defaultQuiz.id}`}
            className="block bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02]"
          >
            <div className="p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">{defaultQuiz.title}</h3>
              <p className="text-lg text-blue-100 mb-6">
                {defaultQuiz.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {defaultQuiz.completion_count} completions
                </span>
                <span className="text-lg font-medium">Take Quiz →</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search quizzes..."
          className="form-input w-full md:w-96"
        />
      </div>

      {/* Quizzes by Anime */}
      {Object.entries(quizzesByAnime).map(
        ([animeId, { animeName, quizzes }]) => {
          // Filter quizzes based on search
          const filteredQuizzes = quizzes.filter(
            (quiz) =>
              quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredQuizzes.length === 0) return null;

          return (
            <div key={animeId} className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {animeName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    to={`/quizzes/${quiz.id}`}
                    className="bg-white dark:bg-dark-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {quiz.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {quiz.completion_count} completions
                        </span>
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          Take Quiz →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        }
      )}

      {Object.keys(quizzesByAnime).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No quizzes found. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
