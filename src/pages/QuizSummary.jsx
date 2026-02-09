import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  Check,
  X,
  Home,
  Loader2,
  AlertCircle,
  Target,
  Percent,
  Award,
} from "lucide-react";
import { getSubmissionById, getQuizById } from "../services/quizService";

export default function QuizSummary() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const submissionData = await getSubmissionById(submissionId);

        if (!submissionData) {
          setError("Submission not found");
          setLoading(false);
          return;
        }

        const quizData = await getQuizById(submissionData.quizId);

        setSubmission(submissionData);
        setQuiz(quizData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [submissionId]);

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
            to="/home"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { score } = submission;
  const isPassing = score.percentage >= 50;
  const isExcellent = score.percentage >= 80;

  // Determine result message
  let resultMessage = "";
  let resultColor = "";
  if (isExcellent) {
    resultMessage = "Excellent Work!";
    resultColor = "text-green-600";
  } else if (isPassing) {
    resultMessage = "Good Job!";
    resultColor = "text-yellow-600";
  } else {
    resultMessage = "Keep Practicing!";
    resultColor = "text-red-600";
  }

  return (
    <div className="min-h-screen app-bg bg-grid">
      {/* Header */}
      <header className="header-gradient sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/home" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">QuizMaker</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Score Card */}
        <div
          className={`rounded-2xl p-8 text-center mb-8 ${
            isExcellent
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : isPassing
                ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                : "bg-gradient-to-br from-red-500 to-pink-600"
          }`}
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {isExcellent ? (
              <Award className="w-10 h-10 text-white" />
            ) : isPassing ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Target className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {resultMessage}
          </h1>
          <p className="text-white/80 mb-6">{quiz?.title}</p>
          <div className="text-6xl font-bold text-white mb-2">
            {score.percentage}%
          </div>
          <p className="text-white/80 text-lg">
            {score.score} out of {score.total} correct
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card-green rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{score.score}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="stat-card-orange rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {score.total - score.score}
            </p>
            <p className="text-sm text-gray-500">Incorrect</p>
          </div>
          <div className="stat-card-purple rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{score.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="card-gradient rounded-2xl border border-purple-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Question Review
            </h2>
            <p className="text-sm text-gray-500">
              See how you answered each question
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {quiz?.questions.map((question, index) => {
              const userAnswer = submission.answers[index];
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

              // Format user's answer for display
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
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            question.type === "identification"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {question.type === "identification"
                            ? "Identification"
                            : "Multiple Choice"}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-3">
                        {question.question}
                      </p>
                      <div className="space-y-2">
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isCorrect ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <span className="text-sm text-gray-500">
                            Your answer:{" "}
                          </span>
                          <span
                            className={`font-medium ${
                              isCorrect ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {displayAnswer}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="px-4 py-2 rounded-lg bg-gray-50">
                            <span className="text-sm text-gray-500">
                              Correct answer:{" "}
                            </span>
                            <span className="font-medium text-green-700">
                              {correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to="/home"
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Link
            to="/quiz-code"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Take Another Quiz
          </Link>
        </div>
      </main>
    </div>
  );
}
