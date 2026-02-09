import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  FileText,
  CircleDot,
  Save,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getQuizById, updateQuiz } from "../services/quizService";

export default function EditQuiz() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quiz = await getQuizById(quizId);

        if (!quiz) {
          setError("Quiz not found");
          setLoading(false);
          return;
        }

        if (quiz.creatorId !== currentUser?.uid) {
          setError("You don't have permission to edit this quiz");
          setLoading(false);
          return;
        }

        setTitle(quiz.title);
        setDescription(quiz.description || "");
        setShuffleQuestions(quiz.shuffleQuestions || false);

        // Convert questions to editable format
        const editableQuestions = quiz.questions.map((q, index) => ({
          id: Date.now() + index,
          ...q,
          correctAnswers:
            q.correctAnswers || (q.type === "identification" ? [""] : []),
        }));
        setQuestions(editableQuestions);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId, currentUser]);

  function addQuestion(type) {
    const newQuestion = {
      id: Date.now(),
      type,
      question: "",
      ...(type === "identification"
        ? { correctAnswers: [""] }
        : {
            choices: ["", ""],
            correctAnswer: 0,
            multipleCorrect: false,
            correctAnswers: [],
          }),
    };
    setQuestions([...questions, newQuestion]);
  }

  function updateQuestion(index, updates) {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function addCorrectAnswer(qIndex) {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswers.push("");
    setQuestions(newQuestions);
  }

  function updateCorrectAnswer(qIndex, aIndex, value) {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswers[aIndex] = value;
    setQuestions(newQuestions);
  }

  function removeCorrectAnswer(qIndex, aIndex) {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswers = newQuestions[
      qIndex
    ].correctAnswers.filter((_, i) => i !== aIndex);
    setQuestions(newQuestions);
  }

  function addChoice(qIndex) {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices.push("");
    setQuestions(newQuestions);
  }

  function updateChoice(qIndex, cIndex, value) {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices[cIndex] = value;
    setQuestions(newQuestions);
  }

  function removeChoice(qIndex, cIndex) {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];

    if (question.choices.length <= 2) return;

    question.choices = question.choices.filter((_, i) => i !== cIndex);

    if (!question.multipleCorrect) {
      if (question.correctAnswer === cIndex) {
        question.correctAnswer = 0;
      } else if (question.correctAnswer > cIndex) {
        question.correctAnswer--;
      }
    } else {
      question.correctAnswers = question.correctAnswers
        .filter((i) => i !== cIndex)
        .map((i) => (i > cIndex ? i - 1 : i));
    }

    setQuestions(newQuestions);
  }

  function toggleCorrectAnswer(qIndex, cIndex) {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];

    if (question.multipleCorrect) {
      if (question.correctAnswers.includes(cIndex)) {
        question.correctAnswers = question.correctAnswers.filter(
          (i) => i !== cIndex,
        );
      } else {
        question.correctAnswers.push(cIndex);
      }
    } else {
      question.correctAnswer = cIndex;
    }

    setQuestions(newQuestions);
  }

  function toggleMultipleCorrect(qIndex) {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];

    if (!question.multipleCorrect) {
      question.multipleCorrect = true;
      question.correctAnswers = [question.correctAnswer];
    } else {
      question.multipleCorrect = false;
      question.correctAnswer = question.correctAnswers[0] || 0;
      question.correctAnswers = [];
    }

    setQuestions(newQuestions);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a quiz title");
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }

      if (q.type === "identification") {
        if (
          q.correctAnswers.length === 0 ||
          !q.correctAnswers.some((a) => a.trim())
        ) {
          setError(`Question ${i + 1} needs at least one correct answer`);
          return;
        }
      } else {
        if (q.choices.some((c) => !c.trim())) {
          setError(`Question ${i + 1} has empty choices`);
          return;
        }
        if (q.multipleCorrect && q.correctAnswers.length === 0) {
          setError(`Question ${i + 1} needs at least one correct answer`);
          return;
        }
      }
    }

    setSaving(true);

    try {
      const cleanedQuestions = questions.map((q) => {
        if (q.type === "identification") {
          return {
            type: q.type,
            question: q.question.trim(),
            correctAnswers: q.correctAnswers.filter((a) => a.trim()),
          };
        } else {
          const base = {
            type: q.type,
            question: q.question.trim(),
            choices: q.choices.map((c) => c.trim()),
          };

          if (q.multipleCorrect) {
            return { ...base, correctAnswers: q.correctAnswers };
          } else {
            return { ...base, correctAnswer: q.correctAnswer };
          }
        }
      });

      await updateQuiz(quizId, {
        title: title.trim(),
        description: description.trim(),
        questions: cleanedQuestions,
        shuffleQuestions,
      });

      toast.success("Quiz updated successfully!");
      navigate(`/my-quizzes/${quizId}`);
    } catch (err) {
      console.error("Error updating quiz:", err);
      setError("Failed to update quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="min-h-screen app-bg bg-dots flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <Link
            to="/my-quizzes"
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to My Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg bg-grid">
      {/* Header */}
      <header className="header-gradient sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">QuizMaker</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to={`/my-quizzes/${quizId}`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
            <p className="text-gray-500">
              Modify your quiz questions and settings
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Quiz Info */}
          <div className="card-gradient rounded-xl border border-purple-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quiz Information
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Brief description of your quiz"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="shuffle"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="shuffle" className="text-sm text-gray-700">
                  Shuffle question order for each participant
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4 mb-6">
            {questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="card-gradient rounded-xl border border-purple-100 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                      <span className="text-sm font-semibold text-purple-600">
                        {qIndex + 1}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        question.type === "identification"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {question.type === "identification"
                        ? "Identification"
                        : "Multiple Choice"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(qIndex, { question: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Enter your question"
                    />
                  </div>

                  {question.type === "identification" ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Correct Answer(s) *
                        </label>
                        <button
                          type="button"
                          onClick={() => addCorrectAnswer(qIndex)}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          + Add alternative
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.correctAnswers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={answer}
                              onChange={(e) =>
                                updateCorrectAnswer(
                                  qIndex,
                                  aIndex,
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                              placeholder={`Answer ${aIndex + 1}`}
                            />
                            {question.correctAnswers.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeCorrectAnswer(qIndex, aIndex)
                                }
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Choices *
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={question.multipleCorrect}
                              onChange={() => toggleMultipleCorrect(qIndex)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            Multiple correct
                          </label>
                          <button
                            type="button"
                            onClick={() => addChoice(qIndex)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            + Add choice
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {question.choices.map((choice, cIndex) => {
                          const isCorrect = question.multipleCorrect
                            ? question.correctAnswers?.includes(cIndex)
                            : question.correctAnswer === cIndex;

                          return (
                            <div
                              key={cIndex}
                              className="flex items-center gap-2"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  toggleCorrectAnswer(qIndex, cIndex)
                                }
                                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isCorrect
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                {isCorrect && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </button>
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) =>
                                  updateChoice(qIndex, cIndex, e.target.value)
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder={`Choice ${cIndex + 1}`}
                              />
                              {question.choices.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeChoice(qIndex, cIndex)}
                                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              type="button"
              onClick={() => addQuestion("identification")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Add Identification
            </button>
            <button
              type="button"
              onClick={() => addQuestion("multiple-choice")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <CircleDot className="w-5 h-5" />
              Add Multiple Choice
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              to={`/my-quizzes/${quizId}`}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
