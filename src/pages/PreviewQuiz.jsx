import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getQuizById } from "../services/quizService";
import { calculateScore } from "../utils/quizUtils";

export default function PreviewQuiz() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizData = await getQuizById(quizId);

        if (!quizData) {
          setError("Quiz not found");
          setLoading(false);
          return;
        }

        if (quizData.creatorId !== currentUser?.uid) {
          setError("You can only preview your own quizzes");
          setLoading(false);
          return;
        }

        setQuiz(quizData);
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

  function handleSubmit() {
    const result = calculateScore(quiz.questions, answers);
    setScore(result);
    setShowResults(true);
  }

  function resetPreview() {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen app-bg bg-dots flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <Link
            to="/my-quizzes"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to My Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    return (
      <div className="min-h-screen app-bg bg-grid">
        <header className="header-gradient sticky top-0 z-10 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <Link to="/home" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                QuizMaker
              </span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 max-w-3xl">
          {/* Preview Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 font-medium">Preview Mode</span>
            <span className="text-amber-700">
              — This is how participants will see results
            </span>
          </div>

          {/* Score Card */}
          <div
            className={`rounded-2xl p-8 text-center mb-8 ${
              score.percentage >= 80
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : score.percentage >= 50
                  ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                  : "bg-gradient-to-br from-red-500 to-pink-600"
            }`}
          >
            <h1 className="text-2xl font-bold text-white mb-2">
              Preview Complete!
            </h1>
            <p className="text-white/80 mb-6">{quiz.title}</p>
            <div className="text-6xl font-bold text-white mb-2">
              {score.percentage}%
            </div>
            <p className="text-white/80 text-lg">
              {score.score} out of {score.total} correct
            </p>
          </div>

          {/* Question Review */}
          <div className="card-gradient rounded-2xl border border-purple-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-purple-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Question Review
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                let isCorrect = false;
                let correctAnswer = "";

                if (question.type === "identification") {
                  const normalizedUserAnswer = (userAnswer || "")
                    .trim()
                    .toLowerCase();
                  isCorrect = question.correctAnswers.some(
                    (correct) =>
                      correct.trim().toLowerCase() === normalizedUserAnswer,
                  );
                  correctAnswer = question.correctAnswers.join(" or ");
                } else {
                  if (Array.isArray(question.correctAnswers)) {
                    const userAnswers = Array.isArray(userAnswer)
                      ? userAnswer
                      : [userAnswer];
                    isCorrect =
                      userAnswers.length === question.correctAnswers.length &&
                      userAnswers.every((ans) =>
                        question.correctAnswers.includes(ans),
                      ) &&
                      question.correctAnswers.every((ans) =>
                        userAnswers.includes(ans),
                      );
                    correctAnswer = question.correctAnswers
                      .map((i) => question.choices[i])
                      .join(", ");
                  } else {
                    isCorrect = userAnswer === question.correctAnswer;
                    correctAnswer = question.choices[question.correctAnswer];
                  }
                }

                let displayAnswer = "";
                if (question.type === "identification") {
                  displayAnswer = userAnswer || "(no answer)";
                } else if (Array.isArray(userAnswer)) {
                  displayAnswer =
                    userAnswer.length > 0
                      ? userAnswer.map((i) => question.choices[i]).join(", ")
                      : "(no answer)";
                } else if (userAnswer !== null && userAnswer !== undefined) {
                  displayAnswer = question.choices[userAnswer];
                } else {
                  displayAnswer = "(no answer)";
                }

                return (
                  <div key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCorrect ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {isCorrect ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <span className="w-5 h-5 text-red-600 font-bold">
                            ✗
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          Q{index + 1}: {question.question}
                        </p>
                        <div
                          className={`px-3 py-2 rounded-lg ${isCorrect ? "bg-green-50" : "bg-red-50"}`}
                        >
                          <span className="text-sm text-gray-500">
                            Your answer:{" "}
                          </span>
                          <span
                            className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}
                          >
                            {displayAnswer}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 mt-2">
                            <span className="text-sm text-gray-500">
                              Correct:{" "}
                            </span>
                            <span className="font-medium text-green-700">
                              {correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetPreview}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              to={`/my-quizzes/${quizId}`}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Quiz
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
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
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Preview Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 font-medium">Preview Mode</span>
          <span className="text-amber-700">
            — Test your quiz before sharing
          </span>
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {quiz.questions.map((_, index) => {
            const isAnswered =
              answers[index] !== null &&
              (typeof answers[index] === "string"
                ? answers[index].trim() !== ""
                : true);
            const isCurrent = index === currentQuestion;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  isCurrent
                    ? "bg-purple-600 text-white"
                    : isAnswered
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="card-gradient rounded-2xl shadow-lg p-8 mb-6 border border-purple-100">
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
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Type your answer here..."
              />
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
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span
                        className={
                          isSelected ? "text-purple-900" : "text-gray-700"
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Finish Preview
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
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
