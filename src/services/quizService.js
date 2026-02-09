import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { generateQuizCode } from "../utils/quizUtils";

// Create a new quiz
export async function createQuiz(userId, quizData) {
  const code = generateQuizCode();

  const quiz = {
    ...quizData,
    code,
    creatorId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "quizzes"), quiz);
  return { id: docRef.id, code };
}

// Get quiz by ID
export async function getQuizById(quizId) {
  const docRef = doc(db, "quizzes", quizId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// Get quiz by code
export async function getQuizByCode(code) {
  const q = query(collection(db, "quizzes"), where("code", "==", code));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  return null;
}

// Get all quizzes created by a user
export async function getUserQuizzes(userId) {
  const q = query(
    collection(db, "quizzes"),
    where("creatorId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Update a quiz
export async function updateQuiz(quizId, updates) {
  const docRef = doc(db, "quizzes", quizId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Delete a quiz
export async function deleteQuiz(quizId) {
  const docRef = doc(db, "quizzes", quizId);
  await deleteDoc(docRef);

  // Also delete all submissions for this quiz
  const submissionsQuery = query(
    collection(db, "submissions"),
    where("quizId", "==", quizId),
  );
  const submissionsSnapshot = await getDocs(submissionsQuery);

  const deletePromises = submissionsSnapshot.docs.map((doc) =>
    deleteDoc(doc.ref),
  );
  await Promise.all(deletePromises);
}

// Submit quiz answers
export async function submitQuizAnswers(
  quizId,
  userId,
  userName,
  answers,
  score,
) {
  // Firestore doesn't support nested arrays, so convert array answers to JSON strings
  const serializedAnswers = answers.map((answer) => {
    if (Array.isArray(answer)) {
      return { type: "array", value: answer };
    }
    return answer;
  });

  const submission = {
    quizId,
    userId,
    userName,
    answers: serializedAnswers,
    score,
    submittedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "submissions"), submission);
  return { id: docRef.id, ...submission };
}

// Helper to deserialize answers from Firestore format
function deserializeAnswers(answers) {
  if (!answers) return [];
  return answers.map((answer) => {
    if (answer && typeof answer === "object" && answer.type === "array") {
      return answer.value;
    }
    return answer;
  });
}

// Get all submissions for a quiz
export async function getQuizSubmissions(quizId) {
  const q = query(
    collection(db, "submissions"),
    where("quizId", "==", quizId),
    orderBy("submittedAt", "desc"),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      answers: deserializeAnswers(data.answers),
    };
  });
}

// Get all quizzes answered by a user
export async function getUserSubmissions(userId) {
  const q = query(
    collection(db, "submissions"),
    where("userId", "==", userId),
    orderBy("submittedAt", "desc"),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      answers: deserializeAnswers(data.answers),
    };
  });
}

// Check if user has already submitted this quiz
export async function hasUserSubmittedQuiz(quizId, userId) {
  const q = query(
    collection(db, "submissions"),
    where("quizId", "==", quizId),
    where("userId", "==", userId),
  );
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
}

// Get submission by ID
export async function getSubmissionById(submissionId) {
  const docRef = doc(db, "submissions", submissionId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      answers: deserializeAnswers(data.answers),
    };
  }
  return null;
}
