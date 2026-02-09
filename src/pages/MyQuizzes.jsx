import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Search,
  ClipboardList,
  Users,
  Copy,
  Check,
  Trash2,
  ChevronRight,
  Loader2,
  Eye,
  Pencil,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useModal } from "../contexts/ModalContext";
import {
  getUserQuizzes,
  deleteQuiz,
  getQuizSubmissions,
} from "../services/quizService";
import { formatDate } from "../utils/quizUtils";
import { QuizListSkeleton } from "../components/Skeleton";
import Tooltip from "../components/Tooltip";

export default function MyQuizzes() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchQuizzes() {
      if (!currentUser) return;

      try {
        const userQuizzes = await getUserQuizzes(currentUser.uid);

        // Fetch submission counts for each quiz
        const quizzesWithCounts = await Promise.all(
          userQuizzes.map(async (quiz) => {
            const submissions = await getQuizSubmissions(quiz.id);
            return { ...quiz, submissionCount: submissions.length };
          }),
        );

        setQuizzes(quizzesWithCounts);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [currentUser]);

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast("Quiz code copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleDelete(quizId) {
    showModal({
      title: "Delete Quiz",
      message:
        "Are you sure you want to delete this quiz? All submissions will also be deleted. This action cannot be undone.",
      confirmText: "Delete",
      confirmStyle: "danger",
      onConfirm: async () => {
        setDeletingId(quizId);
        try {
          await deleteQuiz(quizId);
          setQuizzes(quizzes.filter((q) => q.id !== quizId));
          showToast("Quiz deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting quiz:", error);
          showToast("Failed to delete quiz. Please try again.", "error");
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen app-bg bg-grid">
        {/* Header */}
        <header className="header-gradient sticky top-0 z-10 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                QuizMaker
              </span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 text-gray-400">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
                <p className="text-gray-500">
                  Manage and view your created quizzes
                </p>
              </div>
            </div>
          </div>
          <QuizListSkeleton count={4} />
        </main>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
              <p className="text-gray-500">
                Manage and view your created quizzes
              </p>
            </div>
          </div>
          <Link
            to="/create-quiz"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Quiz
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or code..."
            className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white transition-shadow hover:shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quiz List */}
        {filteredQuizzes.length === 0 ? (
          <div className="card-gradient rounded-xl border border-purple-100 p-16 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-gray-400" />
            </div>
            {quizzes.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No quizzes yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Get started by creating your first quiz. It only takes a few
                  minutes!
                </p>
                <Link
                  to="/create-quiz"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Quiz
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try a different search term
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className="card-gradient rounded-xl border border-purple-100 p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200 animate-fade-in-up group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/my-quizzes/${quiz.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                    >
                      {quiz.title}
                    </Link>
                    {quiz.description && (
                      <p className="text-gray-500 mt-1 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Code:</span>
                        <button
                          onClick={() => copyCode(quiz.code)}
                          className="flex items-center gap-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          {quiz.code}
                          {copiedCode === quiz.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <ClipboardList className="w-4 h-4" />
                        {quiz.questions?.length || 0} questions
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {quiz.submissionCount} responses
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip text="Preview quiz">
                      <Link
                        to={`/preview-quiz/${quiz.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </Tooltip>
                    <Tooltip text="Edit quiz">
                      <Link
                        to={`/edit-quiz/${quiz.id}`}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>
                    </Tooltip>
                    <Tooltip text="Delete quiz">
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        disabled={deletingId === quiz.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === quiz.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </Tooltip>
                    <Link
                      to={`/my-quizzes/${quiz.id}`}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group-hover:translate-x-1"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
