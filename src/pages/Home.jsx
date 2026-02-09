import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  ClipboardList,
  Users,
  Trophy,
  LogOut,
  Code,
  ChevronRight,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserQuizzes,
  getUserSubmissions,
  getQuizSubmissions,
  getQuizById,
} from "../services/quizService";
import { formatDate } from "../utils/quizUtils";
import { StatsSkeleton, Skeleton } from "../components/Skeleton";
import Tooltip from "../components/Tooltip";

export default function Home() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("created");
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [answeredQuizzes, setAnsweredQuizzes] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;

      try {
        // Fetch created quizzes
        const quizzes = await getUserQuizzes(currentUser.uid);
        setCreatedQuizzes(quizzes);

        // Fetch submissions for created quizzes
        const submissionsPromises = quizzes
          .slice(0, 5)
          .map((quiz) =>
            getQuizSubmissions(quiz.id).then((subs) =>
              subs.map((sub) => ({ ...sub, quizTitle: quiz.title })),
            ),
          );
        const allSubmissions = (await Promise.all(submissionsPromises)).flat();
        allSubmissions.sort((a, b) => {
          const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt);
          const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt);
          return dateB - dateA;
        });
        setRecentSubmissions(allSubmissions.slice(0, 10));

        // Fetch answered quizzes
        const submissions = await getUserSubmissions(currentUser.uid);
        const answeredWithQuiz = await Promise.all(
          submissions.map(async (sub) => {
            const quiz = await getQuizById(sub.quizId);
            return { ...sub, quiz };
          }),
        );
        setAnsweredQuizzes(answeredWithQuiz);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen app-bg">
        {/* Header */}
        <header className="header-gradient">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                QuizMaker
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton variant="circular" className="w-8 h-8" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          {/* Stats Skeleton */}
          <StatsSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg bg-grid">
      {/* Header */}
      <header className="header-gradient backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">QuizMaker</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome,{" "}
              <span className="font-semibold text-purple-700">
                {userProfile?.name || "User"}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/create-quiz"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 flex items-center gap-4 hover:opacity-90 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-200/50 transition-all active:scale-[0.98] group"
          >
            <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create New Quiz</h3>
              <p className="text-white/80 text-sm">Start building your quiz</p>
            </div>
            <ChevronRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/quiz-code"
            className="bg-white border border-gray-200 text-gray-900 rounded-xl p-6 flex items-center gap-4 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Enter Quiz Code</h3>
              <p className="text-gray-500 text-sm">Answer an existing quiz</p>
            </div>
            <ChevronRight className="w-5 h-5 ml-auto text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card-blue rounded-xl p-6 hover:shadow-lg hover:shadow-blue-100 transition-all animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-500/20 p-2.5 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-blue-700/70 font-medium">
                Created Quizzes
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {createdQuizzes.length}
            </p>
          </div>
          <div className="stat-card-green rounded-xl p-6 hover:shadow-lg hover:shadow-green-100 transition-all animate-fade-in-up stagger-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500/20 p-2.5 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-green-700/70 font-medium">
                Quizzes Answered
              </span>
            </div>
            <p className="text-3xl font-bold text-green-900">
              {answeredQuizzes.length}
            </p>
          </div>
          <div className="stat-card-orange rounded-xl p-6 hover:shadow-lg hover:shadow-orange-100 transition-all animate-fade-in-up stagger-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-500/20 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-orange-700/70 font-medium">
                Total Responses
              </span>
            </div>
            <p className="text-3xl font-bold text-orange-900">
              {recentSubmissions.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-gradient rounded-xl shadow-sm">
          <div className="border-b border-purple-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("created")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "created"
                    ? "border-purple-600 text-purple-600 bg-purple-50/50"
                    : "border-transparent text-gray-500 hover:text-purple-600 hover:bg-purple-50/30"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline-block mr-2" />
                My Quizzes
              </button>
              <button
                onClick={() => setActiveTab("answered")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "answered"
                    ? "border-purple-600 text-purple-600 bg-purple-50/50"
                    : "border-transparent text-gray-500 hover:text-purple-600 hover:bg-purple-50/30"
                }`}
              >
                <FileText className="w-4 h-4 inline-block mr-2" />
                Answered Quizzes
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "submissions"
                    ? "border-purple-600 text-purple-600 bg-purple-50/50"
                    : "border-transparent text-gray-500 hover:text-purple-600 hover:bg-purple-50/30"
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Recent Responses
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "created" && (
              <div>
                {createdQuizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No quizzes yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first quiz to get started
                    </p>
                    <Link
                      to="/create-quiz"
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {createdQuizzes.map((quiz) => (
                      <Link
                        key={quiz.id}
                        to={`/my-quizzes/${quiz.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {quiz.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Code:{" "}
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {quiz.code}
                            </span>
                            {" • "}
                            {quiz.questions?.length || 0} questions
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    ))}
                    <div className="pt-4">
                      <Link
                        to="/my-quizzes"
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View all quizzes →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "answered" && (
              <div>
                {answeredQuizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No answered quizzes
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Enter a quiz code to answer a quiz
                    </p>
                    <Link
                      to="/quiz-code"
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Code className="w-4 h-4" />
                      Enter Code
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {answeredQuizzes.map((submission) => (
                      <Link
                        key={submission.id}
                        to={`/quiz-summary/${submission.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {submission.quiz?.title || "Quiz"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Score: {submission.score.score}/
                            {submission.score.total} (
                            {submission.score.percentage}%)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              submission.score.percentage >= 80
                                ? "bg-green-100 text-green-700"
                                : submission.score.percentage >= 50
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {submission.score.percentage}%
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div>
                {recentSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No responses yet
                    </h3>
                    <p className="text-gray-500">
                      Share your quiz code with others to get responses
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {submission.userName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {submission.quizTitle} • Score:{" "}
                            {submission.score.score}/{submission.score.total}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            submission.score.percentage >= 80
                              ? "bg-green-100 text-green-700"
                              : submission.score.percentage >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {submission.score.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
