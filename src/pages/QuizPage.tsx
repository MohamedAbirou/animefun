import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/lib/supabase";
import { Quiz, QuizQuestion } from "@/types/quiz";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [characterPoints, setCharacterPoints] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showResults, setShowResults] = useState(false);
  // const { checkFeatureAccess } = useSubscriptionStore();

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const [quizResponse, charactersResponse] = await Promise.all([
        supabase
          .from("quizzes")
          .select("*, anime_series(id, name)")
          .eq("id", id)
          .single(),
        supabase.from("anime_characters").select("*"),
      ]);

      if (quizResponse.error) throw quizResponse.error;

      const quiz = quizResponse.data as unknown as Quiz;
      const characters = charactersResponse.data;

      // Get random questions within min/max range
      const numQuestions =
        Math.floor(
          Math.random() * (quiz.max_questions - quiz.min_questions + 1)
        ) + quiz.min_questions;

      // Questions are stored in the quiz.questions JSONB field
      const allQuestions = quiz.questions || [];

      // Randomly select questions
      const selectedQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, numQuestions);

      setQuiz(quiz);
      setQuestions(selectedQuestions);

      // Initialize character points
      const points: Record<string, number> = {};
      Object.keys(characters || {}).forEach((charName) => {
        points[charName] = 0;
      });
      setCharacterPoints(points);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
      navigate("/quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    // Update character points based on the answer
    const question = questions[currentQuestion];
    if (question && question.options) {
      const selectedOption = question.options.find(
        (opt: any) => opt.character_id === answer
      );
      if (selectedOption) {
        setCharacterPoints((prev) => ({
          ...prev,
          [selectedOption.character_id]:
            (prev[selectedOption.character_id] || 0) + 1,
        }));
      }
    }

    // Move to next question or show results screen
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const finishQuiz = async () => {
    if (!quiz) return;

    // Check if user has subscription access for quiz results
    // if (!checkFeatureAccess('quiz_results')) {
    //   // Show subscription modal instead of error
    //   const event = new CustomEvent('showSubscriptionModal', { 
    //     detail: { feature: 'quiz results' } 
    //   });
    //   window.dispatchEvent(event);
    //   return;
    // }

    try {
      // Find character with highest points
      const winner = Object.entries(characterPoints).reduce((a, b) =>
        characterPoints[a[0]] > characterPoints[b[0]] ? a : b
      )[0];

      const sessionId =
        localStorage.getItem("session_id") || crypto.randomUUID();

      // Save result
      const { data, error } = await supabase
        .from("quiz_results")
        .insert({
          quiz_id: quiz.id,
          character_id: winner,
          session_id: sessionId,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Update completion count
      await supabase
        .from("quizzes")
        .update({ completion_count: (quiz.completion_count || 0) + 1 })
        .eq("id", quiz.id);

      // Track completion
      await supabase.from("stats").insert({
        interaction_type: "quiz_completion",
        item_id: quiz.id,
        session_id: sessionId,
      });

      // Navigate to results
      navigate(`/quizzes/${quiz.id}/results/${data.id}`);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast.error("Failed to save quiz result");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quiz not found
        </h2>
        <button
          onClick={() => navigate("/quizzes")}
          className="btn btn-primary"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Show results screen with subscription check
  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You've answered all the questions. Ready to discover which character
            matches your personality?
          </p>

          <button
            onClick={finishQuiz}
            className="btn btn-primary px-8 py-3 text-lg"
          >
            View Your Results
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {quiz.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {currentQuestionData.text}
          </h2>

          <div className="space-y-4">
            {currentQuestionData.options.map((option: any) => (
              <button
                key={option.character_id}
                onClick={() => handleAnswer(option.character_id)}
                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors duration-200"
              >
                <span className="text-gray-900 dark:text-white">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
