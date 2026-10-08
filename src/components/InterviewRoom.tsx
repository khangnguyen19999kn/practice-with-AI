import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleStop,
  LoaderCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDifficultyKey, localizeQuestion } from "../i18n/question";
import type {
  InterviewQuestion,
  Language,
  SavedInterviewOptions,
} from "../types";
import GeminiLoadingOverlay from "./GeminiLoadingOverlay";

type InterviewRoomProps = {
  question: InterviewQuestion;
  options: SavedInterviewOptions;
  duration: string;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  loading: boolean;
  error: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onEnd: () => void;
};

export default function InterviewRoom({
  question,
  options,
  duration,
  questionNumber,
  totalQuestions,
  answer,
  loading,
  error,
  onAnswerChange,
  onSubmit,
  onEnd,
}: InterviewRoomProps) {
  const { t, i18n } = useTranslation();
  const language: Language = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const localizedQuestion = localizeQuestion(question, language);
  const isLastQuestion = questionNumber === totalQuestions;
  const progress = (questionNumber / totalQuestions) * 100;
  return (
    <main className="page-content room-page" aria-busy={loading}>
      {loading && (
        <GeminiLoadingOverlay
          titleKey="interview.gradingOverlayTitle"
          messageKey="interview.gradingOverlayBody"
        />
      )}
      <div className="room-topline">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> {t("interview.roomEyebrow")}
          </div>
          <h1>
            {t("interview.roomTitleStart")}{" "}
            <span>{t("interview.roomTitleAccent")}</span>
          </h1>
        </div>
        <button className="button button-secondary end-button" onClick={onEnd}>
          <CircleStop size={16} /> {t("interview.saveAndExit")}
        </button>
      </div>
      <section className="room-shell question-session-shell">
        <header className="room-header">
          <div className="room-avatar">
            <Check size={18} />
          </div>
          <div className="room-heading">
            <strong>{options.role}</strong>
            <span>
              {t(getDifficultyKey(options.level))} <i />{" "}
              {t(`interview.duration${duration}`)}
            </span>
          </div>
          <span className="room-live">
            {t("interview.questionProgress", {
              current: questionNumber,
              total: totalQuestions,
            })}
          </span>
        </header>
        <div className="interview-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="question-session-content">
          <div className="question-meta">
            <span className="category-label">{question.topic}</span>
            <span
              className={`level-label level-${question.difficulty.toLocaleLowerCase()}`}
            >
              {t(getDifficultyKey(question.difficulty))}
            </span>
          </div>
          <h2 className="active-question">{localizedQuestion.question}</h2>
          <label className="candidate-answer-label" htmlFor="candidate-answer">
            {t("interview.yourAnswer")}
          </label>
          <textarea
            id="candidate-answer"
            className="candidate-answer"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder={t("interview.answerPlaceholder")}
            rows={7}
            disabled={loading}
            autoFocus
          />
          <p className="answer-save-note">
            <Check size={14} /> {t("interview.answerAutosaved")}
          </p>
          {error && (
            <p className="form-error" role="alert">
              {t(error)}
            </p>
          )}
        </div>
        <footer className="question-session-footer">
          <span>{t("interview.currentTopic", { topic: question.topic })}</span>
          <button
            className="button button-primary"
            onClick={onSubmit}
            disabled={loading || !answer.trim()}
          >
            {loading ? (
              <LoaderCircle size={16} className="spinner" />
            ) : isLastQuestion ? (
              <Check size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
            {loading
              ? t("interview.evaluating")
              : isLastQuestion
                ? t("interview.finishAndEvaluate")
                : t("interview.saveAndNext")}
          </button>
        </footer>
      </section>
      <div className="room-footnote">
        <span className="status-dot" /> {t("interview.localSessionNote")}
        <button className="text-button" onClick={onEnd}>
          <ArrowLeft size={13} /> {t("interview.backToSetup")}
        </button>
      </div>
    </main>
  );
}
