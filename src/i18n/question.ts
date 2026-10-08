import type {
  Difficulty,
  Language,
  LocalizedQuestion,
  Question,
} from "../types";

export function localizeQuestion(
  question: Question,
  language: Language,
): LocalizedQuestion {
  return { ...question, ...question.translations[language] };
}

export function getDifficultyKey(difficulty: Difficulty): string {
  return `difficulty.${difficulty.toLocaleLowerCase()}`;
}
