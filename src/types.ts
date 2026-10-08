export type Difficulty = "Fresher" | "Junior" | "Middle" | "Senior";
export type Language = "en" | "vi";

export type QuestionTranslation = {
  question: string;
  answer: string;
};

export type Question = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  tags: string[];
  translations: Record<Language, QuestionTranslation>;
};

export type LocalizedQuestion = Omit<Question, "translations"> &
  QuestionTranslation;

export type ViewName = "questions" | "interview";

export type InterviewOptions = {
  role: string;
  level: Difficulty;
  focus: string;
  topics: string[];
  jobDescription: string;
  resumeText: string;
  resumeName: string;
};

export type InterviewQuestion = Question & {
  rubric: string[];
};

export type SavedInterviewOptions = Pick<
  InterviewOptions,
  "role" | "level" | "focus" | "topics"
>;

export type QuestionEvaluation = {
  questionId: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
};

export type InterviewEvaluation = {
  verdict: "pass" | "fail";
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  results: QuestionEvaluation[];
};

export type InterviewSession = {
  id: string;
  options: SavedInterviewOptions;
  language: Language;
  duration: string;
  questions: InterviewQuestion[];
  answers: string[];
  currentIndex: number;
  evaluation: InterviewEvaluation | null;
  updatedAt: string;
};
