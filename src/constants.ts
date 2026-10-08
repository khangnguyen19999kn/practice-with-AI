import type { Difficulty } from "./types";

export const APP_NAME = "Practice Studio";
export const GEMINI_MODEL = "gemini-3.5-flash";
export const GEMINI_REQUEST_TIMEOUT_MS = 90_000;
export const MAX_RESUME_CHARACTERS = 18_000;
export const MAX_JOB_DESCRIPTION_CHARACTERS = 10_000;
export const MAX_QUESTION_FILE_BYTES = 1_000_000;
export const QUESTION_STORAGE_KEY = "interview-studio.questions.v1";
export const INTERVIEW_SESSION_STORAGE_KEY =
  "interview-studio.active-interview.v1";
export const DIFFICULTIES: Difficulty[] = [
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
];
export const INTERVIEW_LENGTHS = ["15", "30", "45"];
export const INTERVIEW_QUESTION_COUNTS: Record<string, number> = {
  "15": 4,
  "30": 8,
  "45": 12,
};
export const PASSING_SCORE_THRESHOLD = 70;
export const DEFAULT_ROLE = "Frontend Developer";
export const DEFAULT_INTERVIEW_LENGTH = "30";
