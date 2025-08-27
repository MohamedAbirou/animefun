import { supabase } from "@/lib/supabase";
import { AnimeCharacter, Quiz } from "@/types/quiz";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quiz?: Quiz;
  onSuccess: () => void;
}

export default function AddEditQuizModal({
  isOpen,
  onClose,
  quiz,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: quiz || {
      title: "",
      description: "",
      anime_id: "",
      min_questions: 5,
      max_questions: 10,
      questions: [
        {
          text: "",
          options: [
            { text: "", character_id: "" },
            { text: "", character_id: "" },
          ],
        },
      ],
      is_default: false,
      use_locker: true,
    },
  });

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const selectedAnimeId = watch("anime_id");

  useEffect(() => {
    if (quiz) {
      reset(quiz);
    } else {
      reset({
        title: "",
        description: "",
        anime_id: "",
        min_questions: 5,
        max_questions: 10,
        questions: [
          {
            text: "",
            options: [
              { text: "", character_id: "" },
              { text: "", character_id: "" },
            ],
          },
        ],
        is_default: false,
        use_locker: true,
      });
    }
  }, [quiz, reset]);

  // Fetch anime series on mount
  useEffect(() => {
    const fetchSeries = async () => {
      const { data } = await supabase
        .from("anime_series")
        .select("id, name")
        .order("name");

      setSeries(data || []);
    };

    fetchSeries();
  }, []);

  // Fetch characters when anime is selected
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!selectedAnimeId) {
        setCharacters([]);
        return;
      }

      const { data } = await supabase
        .from("anime_characters")
        .select("*")
        .eq("anime_id", selectedAnimeId)
        .order("name");

      setCharacters(data || []);
    };

    fetchCharacters();
  }, [selectedAnimeId]);

  const handleAddOption = useCallback(
    (questionIndex: number) => {
      const currentQuestions = questions[questionIndex].options || [];
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [...currentQuestions, { text: "", character_id: "" }],
      };
      reset({ ...quiz, questions: updatedQuestions });
    },
    [questions, reset, quiz]
  );

  const handleRemoveOption = useCallback(
    (questionIndex: number, optionIndex: number) => {
      const currentOptions = questions[questionIndex].options;
      if (currentOptions.length <= 2) return; // Maintain minimum 2 options

      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: currentOptions.filter((_, idx) => idx !== optionIndex),
      };
      reset({ ...quiz, questions: updatedQuestions });
    },
    [questions, reset, quiz]
  );

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      delete data.anime_series;

      // Basic validation
      if (!data.min_questions || !data.max_questions) {
        throw new Error("Please specify minimum and maximum questions");
      }

      const minQ = parseInt(data.min_questions);
      const maxQ = parseInt(data.max_questions);

      if (minQ > maxQ) {
        throw new Error(
          "Minimum questions cannot be greater than maximum questions"
        );
      }

      if (data.questions.length < minQ) {
        throw new Error(`Must have at least ${minQ} questions`);
      }

      if (data.questions.length > maxQ) {
        throw new Error(`Cannot have more than ${maxQ} questions`);
      }

      // Validate each question has at least 2 options
      data.questions.forEach((q: any, i: number) => {
        if (!q.options || q.options.length < 2) {
          throw new Error(`Question ${i + 1} must have at least 2 options`);
        }

        // Validate option fields
        q.options.forEach((opt: any, j: number) => {
          if (!opt.text || !opt.character_id) {
            throw new Error(
              `All fields are required for option ${j + 1} in question ${i + 1}`
            );
          }
        });
      });

      if (quiz) {
        const { error } = await supabase
          .from("quizzes")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", quiz.id);

        if (error) throw error;

        toast.success("Quiz updated successfully");
      } else {
        const { error } = await supabase.from("quizzes").insert(data);

        if (error) throw error;

        toast.success("Quiz created successfully");
      }

      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error(error.message || "Failed to save quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {quiz ? "Edit Quiz" : "Add New Quiz"}
                </Dialog.Title>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-4 space-y-6"
                >
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>
                      <input
                        type="text"
                        {...register("title")}
                        className="form-input"
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        rows={3}
                        className="form-input"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Anime Series
                      </label>
                      <select {...register("anime_id")} className="form-input">
                        <option value="">Select a series</option>
                        {series.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {errors.anime_id && (
                        <p className="text-red-500 text-sm">
                          {errors.anime_id.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Minimum Questions
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 5"
                          {...register("min_questions")}
                          className="form-input"
                        />
                        {errors.min_questions && (
                          <p className="text-red-500 text-sm">
                            {errors.min_questions.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Maximum Questions
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 10"
                          {...register("max_questions")}
                          className="form-input"
                        />
                        {errors.max_questions && (
                          <p className="text-red-500 text-sm">
                            {errors.max_questions.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Questions
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          appendQuestion({
                            text: "",
                            options: [
                              { text: "", character_id: "" },
                              { text: "", character_id: "" },
                            ],
                          })
                        }
                        className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Question
                      </button>
                    </div>

                    {questions.map((question, questionIndex) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Question {questionIndex + 1}
                            </label>
                            <input
                              type="text"
                              {...register(`questions.${questionIndex}.text`)}
                              className="form-input"
                            />
                            {errors.questions &&
                              errors.questions[questionIndex] && (
                                <p className="text-red-500 text-sm">
                                  {
                                    errors.questions[questionIndex].text
                                      ?.message
                                  }
                                </p>
                              )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                          {question.options.map((_, optionIndex: number) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-4"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  {...register(
                                    `questions.${questionIndex}.options.${optionIndex}.text`
                                  )}
                                  placeholder="Option text"
                                  className="form-input"
                                />
                                {errors.questions &&
                                  errors.questions[questionIndex] &&
                                  errors.questions[questionIndex].options &&
                                  errors.questions[questionIndex].options[
                                    optionIndex
                                  ] && (
                                    <p className="text-red-500 text-sm">
                                      {
                                        errors.questions[questionIndex].options[
                                          optionIndex
                                        ].text?.message
                                      }
                                    </p>
                                  )}
                              </div>
                              <div className="flex-1">
                                <select
                                  {...register(
                                    `questions.${questionIndex}.options.${optionIndex}.character_id`
                                  )}
                                  className="form-input"
                                >
                                  <option value="">Select character</option>
                                  {characters.map((char) => {
                                    return (
                                      <option key={char.id} value={char.id}>
                                        {char.name}
                                      </option>
                                    );
                                  })}
                                </select>
                                {errors.questions &&
                                  errors.questions[questionIndex] &&
                                  errors.questions[questionIndex].options &&
                                  errors.questions[questionIndex].options[
                                    optionIndex
                                  ] && (
                                    <p className="text-red-500 text-sm">
                                      {
                                        errors.questions[questionIndex].options[
                                          optionIndex
                                        ].character_id?.message
                                      }
                                    </p>
                                  )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOption(questionIndex, optionIndex)
                                }
                                className="text-red-500 hover:text-red-700"
                                disabled={question.options.length <= 2}
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption(questionIndex)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          {...register("is_default")}
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        Set as Default Quiz
                      </label>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        {...register("use_locker")}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                        Enable Content Locker
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
