import {
  INTERVIEW_SESSION_STORAGE_KEY,
  PASSING_SCORE_THRESHOLD,
} from "../constants";
import type {
  Difficulty,
  InterviewEvaluation,
  InterviewQuestion,
  InterviewSession,
  Language,
} from "../types";
import { normalizeQuestion } from "./questionStore";

const levelValues: Difficulty[] = ["Fresher", "Junior", "Middle", "Senior"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function normalizeEvaluation(
  value: unknown,
  questionIds: Set<string>,
): InterviewEvaluation | null {
  if (!isRecord(value) || !Array.isArray(value.results)) return null;
  if (
    typeof value.summary !== "string" ||
    !isStringArray(value.strengths) ||
    !isStringArray(value.improvements)
  )
    return null;

  const results = value.results.flatMap((result) => {
    if (
      !isRecord(result) ||
      typeof result.questionId !== "string" ||
      !questionIds.has(result.questionId)
    )
      return [];
    if (typeof result.score !== "number" || typeof result.feedback !== "string")
      return [];
    if (!isStringArray(result.strengths) || !isStringArray(result.improvements))
      return [];
    return [
      {
        questionId: result.questionId,
        score: Math.min(100, Math.max(0, result.score)),
        feedback: result.feedback,
        strengths: result.strengths,
        improvements: result.improvements,
      },
    ];
  });

  if (results.length !== questionIds.size) return null;
  const overallScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length,
  );

  return {
    verdict: overallScore >= PASSING_SCORE_THRESHOLD ? "pass" : "fail",
    overallScore,
    summary: value.summary,
    strengths: value.strengths,
    improvements: value.improvements,
    results,
  };
}

function normalizeSession(value: unknown): InterviewSession | null {
  if (
    !isRecord(value) ||
    !isRecord(value.options) ||
    !Array.isArray(value.questions) ||
    !Array.isArray(value.answers)
  )
    return null;
  const options = value.options;
  if (
    typeof value.id !== "string" ||
    typeof options.role !== "string" ||
    !levelValues.includes(options.level as Difficulty) ||
    typeof options.focus !== "string" ||
    !isStringArray(options.topics) ||
    (value.language !== "en" && value.language !== "vi") ||
    typeof value.duration !== "string" ||
    typeof value.currentIndex !== "number" ||
    typeof value.updatedAt !== "string"
  )
    return null;

  const questions: InterviewQuestion[] = value.questions.flatMap((item) => {
    if (!isRecord(item) || !isStringArray(item.rubric)) return [];
    const question = normalizeQuestion(item);
    return question ? [{ ...question, rubric: item.rubric }] : [];
  });
  if (questions.length !== value.questions.length || questions.length === 0)
    return null;
  if (
    !value.answers.every((answer) => typeof answer === "string") ||
    value.answers.length !== questions.length
  )
    return null;

  const currentIndex = Math.min(
    questions.length - 1,
    Math.max(0, Math.floor(value.currentIndex)),
  );
  const evaluation =
    value.evaluation === null
      ? null
      : normalizeEvaluation(
          value.evaluation,
          new Set(questions.map((question) => question.id)),
        );
  if (value.evaluation !== null && !evaluation) return null;

  return {
    id: value.id,
    options: {
      role: options.role,
      level: options.level as Difficulty,
      focus: options.focus,
      topics: options.topics,
    },
    language: value.language as Language,
    duration: value.duration,
    questions,
    answers: value.answers,
    currentIndex,
    evaluation,
    updatedAt: value.updatedAt,
  };
}

export function loadInterviewSession(): InterviewSession | null {
  try {
    const stored = localStorage.getItem(INTERVIEW_SESSION_STORAGE_KEY);
    return stored ? normalizeSession(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function saveInterviewSession(session: InterviewSession): void {
  localStorage.setItem(INTERVIEW_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearInterviewSession(): void {
  localStorage.removeItem(INTERVIEW_SESSION_STORAGE_KEY);
}
