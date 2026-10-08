import { MAX_QUESTION_FILE_BYTES, QUESTION_STORAGE_KEY } from "../constants";
import type { Difficulty, Question } from "../types";

const difficultyAliases: Record<string, Difficulty> = {
  fresher: "Fresher",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  beginner: "Fresher",
  intermediate: "Middle",
  advanced: "Senior",
  "cơ bản": "Fresher",
  "trung cấp": "Middle",
  "nâng cao": "Senior",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readTranslation(
  value: unknown,
): Question["translations"]["en"] | null {
  if (
    !isRecord(value) ||
    typeof value.question !== "string" ||
    typeof value.answer !== "string"
  )
    return null;
  return { question: value.question, answer: value.answer };
}

export function normalizeQuestion(value: unknown): Question | null {
  if (!isRecord(value)) return null;
  const legacy = readTranslation(value);
  const translations = isRecord(value.translations) ? value.translations : {};
  const english = readTranslation(translations.en) ?? legacy;
  const vietnamese = readTranslation(translations.vi) ?? legacy ?? english;
  const difficulty =
    typeof value.difficulty === "string"
      ? difficultyAliases[value.difficulty.toLocaleLowerCase()]
      : undefined;
  const topic = typeof value.topic === "string" ? value.topic : value.category;

  if (
    typeof value.id !== "string" ||
    typeof topic !== "string" ||
    !difficulty ||
    !Array.isArray(value.tags) ||
    !value.tags.every((tag) => typeof tag === "string") ||
    !english ||
    !vietnamese
  )
    return null;

  return {
    id: value.id,
    topic,
    difficulty,
    tags: value.tags,
    translations: { en: english, vi: vietnamese },
  };
}

const questionFiles = import.meta.glob<unknown[]>("../data/*-question.json", {
  eager: true,
  import: "default",
});
const questionSeed = Object.entries(questionFiles).flatMap(
  ([filePath, questions]) => {
    const normalized = questions.map(normalizeQuestion);
    if (normalized.some((question) => question === null)) {
      throw new Error(`Invalid question data in ${filePath}`);
    }
    return normalized as Question[];
  },
);

export function getQuestions(): Question[] {
  try {
    const stored = localStorage.getItem(QUESTION_STORAGE_KEY);
    if (!stored) return questionSeed;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return questionSeed;
    const normalized = parsed.map(normalizeQuestion);
    if (normalized.some((question) => question === null)) return questionSeed;
    const questionsById = new Map(
      questionSeed.map((question) => [question.id, question]),
    );
    for (const question of normalized as Question[])
      questionsById.set(question.id, question);
    const questions = [...questionsById.values()];
    if (JSON.stringify(parsed) !== JSON.stringify(questions))
      saveQuestions(questions);
    return questions;
  } catch {
    return questionSeed;
  }
}

export function saveQuestions(questions: Question[]): void {
  localStorage.setItem(QUESTION_STORAGE_KEY, JSON.stringify(questions));
}

export async function importQuestions(file: File): Promise<Question[]> {
  if (file.size > MAX_QUESTION_FILE_BYTES) {
    throw new Error("library.errors.fileTooLarge");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("library.errors.invalidJson");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("library.errors.invalidShape");
  }

  const normalized = parsed.map(normalizeQuestion);
  if (normalized.some((question) => question === null))
    throw new Error("library.errors.invalidShape");

  const merged = new Map(
    getQuestions().map((question) => [question.id, question]),
  );
  for (const question of normalized as Question[])
    merged.set(question.id, question);
  return [...merged.values()];
}

export function downloadQuestions(questions: Question[]): void {
  const blob = new Blob([JSON.stringify(questions, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "interview-questions.json";
  link.click();
  URL.revokeObjectURL(url);
}
