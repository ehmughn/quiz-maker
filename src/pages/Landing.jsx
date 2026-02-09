import { Link } from "react-router-dom";
import { BookOpen, Users, Trophy, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">QuizMaker</span>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <Link
                to="/home"
                className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-gray-200 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
          Create & Share
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-yellow-400">
            Amazing Quizzes
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in-up stagger-1">
          Build interactive quizzes with multiple choice and identification
          questions. Share them with a unique code and track your results in
          real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
          <Link
            to={currentUser ? "/create-quiz" : "/register"}
            className="bg-linear-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 group"
          >
            Create a Quiz{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to={currentUser ? "/quiz-code" : "/login"}
            className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all border border-white/20"
          >
            Answer a Quiz
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything you need to create engaging quizzes
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="bg-linear-to-r from-pink-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Multiple Question Types
            </h3>
            <p className="text-gray-300">
              Create identification and multiple choice questions with flexible
              answer options.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="bg-linear-to-r from-blue-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Easy Sharing</h3>
            <p className="text-gray-300">
              Share your quiz with a unique 11-character code. Anyone can
              participate instantly.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="bg-linear-to-r from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Detailed Analytics
            </h3>
            <p className="text-gray-300">
              Track scores, view responses, and analyze quiz performance with
              detailed statistics.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          How it works
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              step: 1,
              title: "Create your quiz",
              desc: "Add questions, set correct answers, and customize your quiz",
            },
            {
              step: 2,
              title: "Share the code",
              desc: "Get a unique 11-character code to share with participants",
            },
            {
              step: 3,
              title: "Collect responses",
              desc: "Participants enter the code, answer questions, and submit",
            },
            {
              step: 4,
              title: "View results",
              desc: "See detailed statistics and individual responses",
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-linear-to-r from-pink-500 to-orange-500 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/30">
                <span className="text-white font-bold">{item.step}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-linear-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20 hover:border-white/30 transition-all">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to create your first quiz?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of educators and quiz creators today.
          </p>
          <Link
            to={currentUser ? "/create-quiz" : "/register"}
            className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-lg group"
          >
            Get Started Free{" "}
            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-white/10">
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>QuizMaker</span>
          </div>
          <p>&copy; 2026 QuizMaker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
