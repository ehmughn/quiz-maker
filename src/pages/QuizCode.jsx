import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Code,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { getQuizByCode, hasUserSubmittedQuiz } from "../services/quizService";
import { useAuth } from "../contexts/AuthContext";
import { isValidQuizCode } from "../utils/quizUtils";

export default function QuizCode() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function formatCode(value) {
    // Remove any non-alphanumeric characters except dash at position 6
    let cleaned = value.replace(/[^a-zA-Z0-9-]/g, "");

    // If user is typing and length is 5, auto-add dash
    if (cleaned.length === 5 && !cleaned.includes("-")) {
      cleaned = cleaned + "-";
    }

    // If there's already input with a dash, preserve it at position 6
    if (cleaned.length > 5 && cleaned[5] !== "-") {
      const parts = cleaned.replace(/-/g, "");
      cleaned = parts.slice(0, 5) + "-" + parts.slice(5, 10);
    }

    // Limit to 11 characters (XXXXX-XXXXX)
    return cleaned.slice(0, 11);
  }

  function handleCodeChange(e) {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate format
    if (!isValidQuizCode(code)) {
      setError("Please enter a valid 11-character code (format: XXXXX-XXXXX)");
      return;
    }

    setLoading(true);

    try {
      const quiz = await getQuizByCode(code);

      if (!quiz) {
        setError("Quiz not found. Please check the code and try again.");
        setLoading(false);
        return;
      }

      // Check if user is the creator
      if (quiz.creatorId === currentUser?.uid) {
        setError("You cannot answer your own quiz.");
        setLoading(false);
        return;
      }

      // Check if user has already submitted
      if (currentUser) {
        const hasSubmitted = await hasUserSubmittedQuiz(
          quiz.id,
          currentUser.uid,
        );
        if (hasSubmitted) {
          setError("You have already answered this quiz.");
          setLoading(false);
          return;
        }
      }

      navigate(`/answer-quiz/${quiz.id}`);
    } catch (err) {
      console.error("Error looking up quiz:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg bg-dots">
      {/* Header */}
      <header className="header-gradient sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">QuizMaker</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-lg">
        {/* Back Button */}
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        {/* Main Content */}
        <div className="card-gradient rounded-2xl shadow-lg p-8 text-center animate-fade-in-up border border-purple-100">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <Code className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enter Quiz Code
          </h1>
          <p className="text-gray-500 mb-8">
            Enter the 11-character code to start answering a quiz
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 text-left animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                className={`w-full text-center text-3xl font-mono tracking-[0.3em] px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                  error
                    ? "border-red-300"
                    : code.length === 11
                      ? "border-green-300"
                      : "border-gray-200"
                }`}
                placeholder="XXXXX-XXXXX"
                maxLength={11}
                autoFocus
              />
              <p className="text-sm text-gray-400 mt-2">
                Format: 5 characters, dash, 5 characters (case sensitive)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 11}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Looking up quiz...
                </>
              ) : (
                <>
                  Start Quiz
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-purple-50 rounded-xl p-6 animate-fade-in-up stagger-2">
          <h3 className="font-semibold text-purple-900 mb-3">Tips</h3>
          <ul className="space-y-2 text-sm text-purple-700">
            <li>• The quiz code is case-sensitive</li>
            <li>• Make sure to include the dash (-) in the middle</li>
            <li>• Ask the quiz creator if you don't have the code</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
