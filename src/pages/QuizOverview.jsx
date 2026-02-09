import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Copy,
  Check,
  Users,
  Trophy,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  Pencil,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getQuizById, getQuizSubmissions } from "../services/quizService";
import { formatDate } from "../utils/quizUtils";

export default function QuizOverview() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [quizData, submissionsData] = await Promise.all([
          getQuizById(quizId),
          getQuizSubmissions(quizId),
        ]);
        setQuiz(quizData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [quizId]);

  function copyCode() {
    navigator.clipboard.writeText(quiz.code);
    setCopiedCode(true);
    showToast("Quiz code copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  // Calculate statistics
  const stats =
    submissions.length > 0
      ? {
          totalResponses: submissions.length,
          averageScore: Math.round(
            submissions.reduce((acc, sub) => acc + sub.score.percentage, 0) /
              submissions.length,
          ),
          highestScore: Math.max(
            ...submissions.map((sub) => sub.score.percentage),
          ),
          lowestScore: Math.min(
            ...submissions.map((sub) => sub.score.percentage),
          ),
          passRate: Math.round(
            (submissions.filter((sub) => sub.score.percentage >= 50).length /
              submissions.length) *
              100,
          ),
        }
      : null;

  // Calculate per-question statistics
  const questionStats = quiz?.questions?.map((question, index) => {
    const correctCount = submissions.filter((sub) => {
      const answer = sub.answers[index];
      if (question.type === "identification") {
        const normalizedAnswer = (answer || "").trim().toLowerCase();
        return question.correctAnswers.some(
          (correct) => correct.trim().toLowerCase() === normalizedAnswer,
        );
      } else {
        if (Array.isArray(question.correctAnswers)) {
          const userAnswers = Array.isArray(answer) ? answer : [answer];
          return (
            userAnswers.length === question.correctAnswers.length &&
            userAnswers.every((ans) => question.correctAnswers.includes(ans)) &&
            question.correctAnswers.every((ans) => userAnswers.includes(ans))
          );
        }
        return answer === question.correctAnswer;
      }
    }).length;

    return {
      question: question.question,
      correctCount,
      incorrectCount: submissions.length - correctCount,
      percentage:
        submissions.length > 0
          ? Math.round((correctCount / submissions.length) * 100)
          : 0,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen app-bg bg-dots flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz not found
          </h1>
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

      <main className="container mx-auto px-6 py-8">
        {/* Back Button & Title */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <Link
              to="/my-quizzes"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-500 mt-1">{quiz.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Code: {quiz.code}
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <Link
                  to={`/preview-quiz/${quizId}`}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Link>
                <Link
                  to={`/edit-quiz/${quizId}`}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="stat-card-blue rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-500">Responses</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalResponses}
                </p>
              </div>
              <div className="stat-card-purple rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-500">Average</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageScore}%
                </p>
              </div>
              <div className="stat-card-green rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-500">Highest</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.highestScore}%
                </p>
              </div>
              <div className="stat-card-orange rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-500">Lowest</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.lowestScore}%
                </p>
              </div>
              <div className="stat-card-purple rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-500">Pass Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.passRate}%
                </p>
              </div>
            </div>

            {/* Question Performance */}
            <div className="card-gradient rounded-xl border border-purple-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Question Performance
              </h2>
              <div className="space-y-4">
                {questionStats?.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">
                        Q{index + 1}:{" "}
                        {stat.question.length > 50
                          ? stat.question.substring(0, 50) + "..."
                          : stat.question}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          stat.percentage >= 70
                            ? "text-green-600"
                            : stat.percentage >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {stat.percentage}% correct
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stat.percentage >= 70
                            ? "bg-green-500"
                            : stat.percentage >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Responses
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {submissions.map((submission) => (
                  <div key={submission.id}>
                    <button
                      onClick={() =>
                        setExpandedSubmission(
                          expandedSubmission === submission.id
                            ? null
                            : submission.id,
                        )
                      }
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {submission.userName?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {submission.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {submission.submittedAt?.toDate
                              ? formatDate(
                                  submission.submittedAt.toDate().toISOString(),
                                )
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            submission.score.percentage >= 80
                              ? "bg-green-100 text-green-700"
                              : submission.score.percentage >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {submission.score.score}/{submission.score.total} (
                          {submission.score.percentage}%)
                        </div>
                        {expandedSubmission === submission.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedSubmission === submission.id && (
                      <div className="px-4 pb-4 bg-gray-50">
                        <div className="space-y-3 pt-2">
                          {quiz.questions.map((question, qIndex) => {
                            const userAnswer = submission.answers[qIndex];
                            let isCorrect = false;

                            if (question.type === "identification") {
                              const normalizedAnswer = (userAnswer || "")
                                .trim()
                                .toLowerCase();
                              isCorrect = question.correctAnswers.some(
                                (correct) =>
                                  correct.trim().toLowerCase() ===
                                  normalizedAnswer,
                              );
                            } else {
                              if (Array.isArray(question.correctAnswers)) {
                                const userAnswers = Array.isArray(userAnswer)
                                  ? userAnswer
                                  : [userAnswer];
                                isCorrect =
                                  userAnswers.length ===
                                    question.correctAnswers.length &&
                                  userAnswers.every((ans) =>
                                    question.correctAnswers.includes(ans),
                                  ) &&
                                  question.correctAnswers.every((ans) =>
                                    userAnswers.includes(ans),
                                  );
                              } else {
                                isCorrect =
                                  userAnswer === question.correctAnswer;
                              }
                            }

                            return (
                              <div
                                key={qIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrect
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                              >
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  Q{qIndex + 1}: {question.question}
                                </p>
                                <p className="text-sm">
                                  <span className="text-gray-500">
                                    Answer:{" "}
                                  </span>
                                  <span
                                    className={
                                      isCorrect
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }
                                  >
                                    {Array.isArray(userAnswer)
                                      ? userAnswer.join(", ")
                                      : userAnswer || "(no answer)"}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm mt-1">
                                    <span className="text-gray-500">
                                      Correct:{" "}
                                    </span>
                                    <span className="text-green-700">
                                      {question.type === "identification"
                                        ? question.correctAnswers.join(" or ")
                                        : Array.isArray(question.correctAnswers)
                                          ? question.correctAnswers.join(", ")
                                          : question.correctAnswer}
                                    </span>
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No responses yet
            </h3>
            <p className="text-gray-500 mb-4">
              Share your quiz code with others to start collecting responses
            </p>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Quiz Code
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
