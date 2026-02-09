import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getQuizById,
  submitQuizAnswers,
  hasUserSubmittedQuiz,
} from "../services/quizService";
import { calculateScore } from "../utils/quizUtils";

export default function AnswerQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizData = await getQuizById(quizId);

        if (!quizData) {
          setError("Quiz not found");
          setLoading(false);
          return;
        }

        // Check if user already submitted
        if (currentUser) {
          const hasSubmitted = await hasUserSubmittedQuiz(
            quizId,
            currentUser.uid,
          );
          if (hasSubmitted) {
            setError("You have already answered this quiz");
            setLoading(false);
            return;
          }
        }

        // Check if user is the creator
        if (quizData.creatorId === currentUser?.uid) {
          setError("You cannot answer your own quiz");
          setLoading(false);
          return;
        }

        setQuiz(quizData);

        // Create question order (shuffled if enabled)
        let order = quizData.questions.map((_, i) => i);
        if (quizData.shuffleQuestions) {
          // Fisher-Yates shuffle
          for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
          }
        }
        setQuestionOrder(order);
        setAnswers(new Array(quizData.questions.length).fill(null));
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId, currentUser]);

  function updateAnswer(value) {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  }

  function toggleMultipleChoice(index) {
    const currentAnswer = answers[currentQuestion] || [];
    const newAnswer = Array.isArray(currentAnswer) ? [...currentAnswer] : [];

    if (newAnswer.includes(index)) {
      newAnswer.splice(newAnswer.indexOf(index), 1);
    } else {
      newAnswer.push(index);
    }

    updateAnswer(newAnswer);
  }

  function goToQuestion(index) {
    setCurrentQuestion(index);
  }

  function nextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function prevQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  async function handleSubmit() {
    // Check if all questions are answered (answers are in display order)
    const unanswered = answers.findIndex((a, displayIndex) => {
      const originalIndex = questionOrder[displayIndex];
      const q = quiz.questions[originalIndex];
      if (q.type === "identification") {
        return !a || !a.trim();
      } else {
        if (q.correctAnswers && Array.isArray(q.correctAnswers)) {
          return !a || (Array.isArray(a) && a.length === 0);
        }
        return a === null || a === undefined;
      }
    });

    if (unanswered !== -1) {
      setError(`Please answer question ${unanswered + 1}`);
      setCurrentQuestion(unanswered);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Reorder answers from display order back to original question order
      const reorderedAnswers = new Array(quiz.questions.length);
      questionOrder.forEach((originalIndex, displayIndex) => {
        reorderedAnswers[originalIndex] = answers[displayIndex];
      });

      const score = calculateScore(quiz.questions, reorderedAnswers);

      const submission = await submitQuizAnswers(
        quizId,
        currentUser.uid,
        userProfile?.name || "Anonymous",
        reorderedAnswers,
        score,
      );

      navigate(`/quiz-summary/${submission.id}`, { replace: true });
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen app-bg bg-dots flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <Link
            to="/home"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const actualQuestionIndex = questionOrder[currentQuestion];
  const question = quiz.questions[actualQuestionIndex];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isMultipleCorrect =
    question.type === "multiple-choice" &&
    Array.isArray(question.correctAnswers);

  return (
    <div className="min-h-screen app-bg bg-grid">
      {/* Header */}
      <header className="header-gradient sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                QuizMaker
              </span>
            </Link>
            <div className="text-right">
              <p className="font-medium text-gray-900">{quiz.title}</p>
              <p className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {quiz.questions.map((_, index) => {
            const displayIndex = questionOrder.indexOf(index);
            const answerForQuestion = answers[displayIndex];
            const isAnswered =
              answerForQuestion !== null &&
              (typeof answerForQuestion === "string"
                ? answerForQuestion.trim() !== ""
                : true);
            const isCurrent = displayIndex === currentQuestion;

            return (
              <button
                key={index}
                onClick={() => goToQuestion(displayIndex)}
                className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isCurrent
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                    : isAnswered
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {displayIndex + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div
          className="card-gradient rounded-2xl shadow-lg p-8 mb-6 animate-fade-in border border-purple-100"
          key={currentQuestion}
        >
          <div className="flex items-center gap-3 mb-6">
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
              {isMultipleCorrect && " (Select multiple)"}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {question.question}
          </h2>

          {question.type === "identification" ? (
            <div>
              <input
                type="text"
                value={answers[currentQuestion] || ""}
                onChange={(e) => updateAnswer(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
                placeholder="Type your answer here..."
                autoFocus
              />
              <p className="text-sm text-gray-400 mt-2">
                Answer is not case sensitive
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {question.choices.map((choice, index) => {
                const isSelected = isMultipleCorrect
                  ? (answers[currentQuestion] || []).includes(index)
                  : answers[currentQuestion] === index;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isMultipleCorrect) {
                        toggleMultipleChoice(index);
                      } else {
                        updateAnswer(index);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 shadow-md shadow-purple-100"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-500 scale-110"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span
                        className={
                          isSelected
                            ? "text-purple-900 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {choice}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
