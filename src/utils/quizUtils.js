// Generate a random alphanumeric quiz code in format: XXXXX-XXXXX (11 chars with dash at position 6)
export function generateQuizCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  code += "-";

  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

// Validate quiz code format
export function isValidQuizCode(code) {
  if (!code || code.length !== 11) return false;
  if (code[5] !== "-") return false;

  const alphanumeric = /^[a-zA-Z0-9]$/;
  for (let i = 0; i < code.length; i++) {
    if (i === 5) continue;
    if (!alphanumeric.test(code[i])) return false;
  }

  return true;
}

// Normalize answer for comparison (trim whitespace, case insensitive)
export function normalizeAnswer(answer) {
  return answer.trim().toLowerCase();
}

// Check if an answer is correct for identification questions
export function checkIdentificationAnswer(userAnswer, correctAnswers) {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  return correctAnswers.some(
    (correct) => normalizeAnswer(correct) === normalizedUserAnswer,
  );
}

// Calculate score for a quiz submission
export function calculateScore(questions, answers) {
  let score = 0;
  let total = questions.length;

  questions.forEach((question, index) => {
    const userAnswer = answers[index];

    if (question.type === "identification") {
      if (
        checkIdentificationAnswer(userAnswer || "", question.correctAnswers)
      ) {
        score++;
      }
    } else if (question.type === "multiple-choice") {
      if (Array.isArray(question.correctAnswers)) {
        // Multiple correct answers
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];
        const isCorrect =
          userAnswers.length === question.correctAnswers.length &&
          userAnswers.every((ans) => question.correctAnswers.includes(ans)) &&
          question.correctAnswers.every((ans) => userAnswers.includes(ans));
        if (isCorrect) score++;
      } else {
        // Single correct answer
        if (userAnswer === question.correctAnswer) {
          score++;
        }
      }
    }
  });

  return { score, total, percentage: Math.round((score / total) * 100) };
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
