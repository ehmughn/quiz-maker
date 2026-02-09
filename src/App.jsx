import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ModalProvider } from "./contexts/ModalContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import MyQuizzes from "./pages/MyQuizzes";
import QuizOverview from "./pages/QuizOverview";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import QuizCode from "./pages/QuizCode";
import AnswerQuiz from "./pages/AnswerQuiz";
import QuizSummary from "./pages/QuizSummary";
import PreviewQuiz from "./pages/PreviewQuiz";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quizzes"
                element={
                  <ProtectedRoute>
                    <MyQuizzes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quizzes/:quizId"
                element={
                  <ProtectedRoute>
                    <QuizOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-quiz"
                element={
                  <ProtectedRoute>
                    <CreateQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <EditQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/preview-quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <PreviewQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-code"
                element={
                  <ProtectedRoute>
                    <QuizCode />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/answer-quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <AnswerQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-summary/:submissionId"
                element={
                  <ProtectedRoute>
                    <QuizSummary />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
